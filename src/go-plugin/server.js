const grpc = require('@grpc/grpc-js');
const { EOL } = require('os');
const pem = require('pem').promisified;

const { createNullLogger } = require('../logger');
const { createGRPCServerCredentials, createGRPCServer } = require('../grpc');
const { base64RemovePadding } = require('./utils');

const { createHealthcheckService } = require('../healthcheck/service');
const { createSTDIOService } = require('../grpc-stdio/service');
const { createControllerService } = require('../grpc-controller/service');

class InvalidMagicCookieError extends Error {}

// The Go-Plugin reads lines from STDOUT looking for this message that tells it how to connect
// to the server.
// https://github.com/hashicorp/go-plugin/blob/master/client.go#L675
const createProtocolMessage = (pluginVersion, transmissionType, address, certificate = null) => {
  return [
    1,
    pluginVersion,
    transmissionType,
    address,
    'grpc',
    certificate,
  ].filter(Boolean).join('|') + EOL;
};

const createGoPluginServer = async (handshake, pluginServices = [], logger = createNullLogger()) => {
  const path = `/tmp/terraform-${Math.floor(Math.random() * 100000)}.sock`;
  const protocol = 'unix';
  const url = `${protocol}://${path}`;
  
  // don't print to stdout, print to custom logger implementation
  grpc.setLogger(logger);
  grpc.setLogVerbosity(grpc.logVerbosity.DEBUG)
  const stdioService = await createSTDIOService();
  const healthcheckService = await createHealthcheckService();
  const controllerService = await createControllerService();
  const services = [healthcheckService, stdioService, controllerService, ...pluginServices];

  if (process.env[handshake.MagicCookieKey] !== handshake.MagicCookieValue)
    throw new InvalidMagicCookieError();

  const rootCertificate = process.env['PLUGIN_CLIENT_CERT'];
  if (!rootCertificate) {
    // No root certificate provided; run in insecure mode!
    const server = await createGRPCServer(url, services);
    const message = createProtocolMessage(handshake.ProtocolVersion, address, path);
    process.stdout.write(message);
    return server;
  }

  // Create a Certificate Signing Request, with a randomly generated secret key (clientKey)
  const { csr: signingRequest, clientKey } = await pem.createCSR({
    altNames: ['localhost']
  });
  // And then use the Root Certificate to sign it, creating the certificate for our server
  const { certificate, serviceKey } = await pem.createCertificate({
    certificate: rootCertificate,
    csr: signingRequest,
    clientKey,
  });
  // Use generated server certificates to run in secure mode
  const credentials = createGRPCServerCredentials(rootCertificate, certificate, serviceKey);
  const server = await createGRPCServer(url, services, credentials);
  const message = createProtocolMessage(
    handshake.ProtocolVersion,
    protocol,
    path,
    base64RemovePadding(certificate.split('\n').slice(1, -1).join(''))
  );
  process.stdout.write(message);
  return server;
};

module.exports = {
  InvalidMagicCookieError,
  createGoPluginServer,
};
