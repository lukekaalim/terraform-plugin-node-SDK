const grpc = require('grpc');
const pem = require('pem').promisified;
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

  // we only support grpc
  const address = '0.0.0.0:50051';
  const server = new grpc.Server();

  addHealthcheckService(server);
  addPluginService(server);

  const { certificate: serverCert, clientKey, serviceKey } = await pem.createCertificate({
    selfSigned: true,
    altNames: ['localhost']
  });

  if (clientCert) {
    console.log(
      await pem.readCertificateInfo(clientCert),
      await pem.readCertificateInfo(serverCert),
      clientKey,
      serviceKey
    );
  }

  const grpcServerCreds = grpc.ServerCredentials.createSsl(Buffer.from(serverCert), [], false);
  server.bind(address, grpcServerCreds);
  server.start();

  const marker = [
    1,
    handshake.ProtocolVersion,
    'tcp',
    address,
    'grpc',
    // remove the padding from the base64 encoded string because go is a dumb language
    Buffer.from(serverCert, 'utf8').toString('base64').slice(0, -2)
  ].join('|');

  console.log(marker);

  //await new Promise(res => setTimeout(() => res(), 5000));
  process.stdout.write(marker);
  process.stdout.write('\n');
  return server;
};

module.exports = {
  InvalidMagicCookieError,
  createGoPluginServer,
};
