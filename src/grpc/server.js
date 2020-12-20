const { Server, ServerCredentials } = require('@grpc/grpc-js');

const createGRPCServer = async (address, services = [], credentials = ServerCredentials.createInsecure()) => {
  const server = new Server();

  for (const createService of services) {
    const { definition, implementation } = createService(server);
    server.addService(definition, implementation);
  }

  const port = await new Promise((res, rej) => {
    const callback = (error, port) => error ? rej(error) : res(port);
    server.bindAsync(address, credentials, callback);
  });
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