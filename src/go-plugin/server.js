const grpc = require('grpc');
const pem = require('pem').promisified;
const { createEncodedCert, mark } = require('go-plugin-helper-node');
const { console } = require('../console');

const { addHealthcheckService } = require('../healthcheck/service');

class InvalidMagicCookieError extends Error {
  constructor() {
    super();
  }
}

const createGoPluginServer = async (handshake, addPluginService) => {
  // don't print to stdout, print to custom logger implementation
  grpc.setLogger(console);

  if (process.env[handshake.MagicCookieKey] !== handshake.MagicCookieValue)
    throw new InvalidMagicCookieError();

  const clientCert = process.env['PLUGIN_CLIENT_CERT'];

  console.log(Buffer.from(clientCert).toString('utf8'));

  // we only support grpc
  const address = '0.0.0.0:50051';
  const server = new grpc.Server();

  addHealthcheckService(server);
  addPluginService(server);

  const { certificate: serverCert, clientKey, serviceKey } = await pem.createCertificate({
    selfSigned: true,
    altNames: ['localhost'],
    days: 20,
  });

  const grpcServerCreds = grpc.ServerCredentials.createSsl(Buffer.from(clientCert), []);
  server.bind(address, grpcServerCreds);
  server.start();

  //mark(1, handshake.ProtocolVersion, 'tcp', address, 'grpc', createEncodedCert());

  // process.stdout.write('\n');

  setTimeout(() => {}, 2000)
  return server;
};

module.exports = {
  InvalidMagicCookieError,
  createGoPluginServer,
};
