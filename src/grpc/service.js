const createGRPCImplementation = (requestHandler) => {
  const grpcImplementation = async (call, callback) => {
    try {
      const response = await requestHandler(call.request);
      return callback(null, response);
    } catch (error) {
      console.error(error);
      return callback(error);
    }
  };

  return grpcImplementation;
};

const createGRPCService = (definition, implementation) => (server) => {
  return {
    definition,
    implementation,
  };
};

module.exports = {
  createGRPCService,
  createGRPCImplementation
};