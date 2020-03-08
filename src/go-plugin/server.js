const grpc = require('grpc');
const pem = require('pem').promisified;
const { console } = require('../console');

const { addHealthcheckService } = require('../healthcheck/service');

const base64RemovePadding = (str) => {
  return str.replace(/={1,2}$/, '');
}

class InvalidMagicCookieError extends Error {}
class InvalidRootCertificate extends Error {}

const createGoPluginServer = async (handshake, addPluginService) => {
  // don't print to stdout, print to custom logger implementation
  grpc.setLogger(console);

  if (process.env[handshake.MagicCookieKey] !== handshake.MagicCookieValue)
    throw new InvalidMagicCookieError();

  const rootCert = process.env['PLUGIN_CLIENT_CERT'];
  if (!await pem.checkCertificate(rootCert))
    throw new InvalidRootCertificate();

  // we only support grpc
  const address = '0.0.0.0:50051';
  const server = new grpc.Server();

  addHealthcheckService(server);
  addPluginService(server);

  const { csr, clientKey } = await pem.createCSR();
  const { certificate: serverCert, serviceKey } = await pem.createCertificate({
    certificate: rootCert,
    csr,
    clientKey,
  });
  
  const grpcServerCreds = grpc.ServerCredentials.createSsl(Buffer.from(rootCert), [
    {
      private_key: Buffer.from(serviceKey),
      cert_chain: Buffer.from(serverCert),
    }
  ]);
  server.bind(address, grpcServerCreds);
  server.start();

  process.stdout.write([
    1,
    handshake.ProtocolVersion,
    'tcp',
    address,
    'grpc',
    base64RemovePadding(serverCert.split('\n').slice(1, -1).join('')),
  ].join('|'))
  process.stdout.write('\n');

  console.log(base64RemovePadding(serverCert.split('\n').slice(1, -1).join('')));
  console.log(serverCert);

  return server;
};

module.exports = {
  InvalidMagicCookieError,
  createGoPluginServer,
};
