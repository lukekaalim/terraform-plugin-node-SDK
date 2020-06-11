const { Server, ServerCredentials } = require('grpc');

const createGRPCServer = (address, services = [], credentials = ServerCredentials.createInsecure()) => {
  const server = new Server();

  for (const { definition, implementation } of services) {
    server.addService(definition, implementation);
  }

  const port = server.bind(address, credentials);
  server.start();

  const shutdown = () => {
    return new Promise(res => server.tryShutdown(res));
  };

  return {
    shutdown,
    port,
  };
};

module.exports = {
  createGRPCServer,
};