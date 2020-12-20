const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const { createNullLogger } = require('../logger');
const { createGRPCService, createGRPCImplementation } = require('../grpc');

const controllerProtoFilePath = path.join(__dirname, './grpc_controller.proto');

const createControllerService = async () => {
  const controllerProto = await protoLoader.load(controllerProtoFilePath);
  const controllerPackage = grpc.loadPackageDefinition(controllerProto);
  return (server) => {
    const implementation = {
      shutdown: () => {
        server.forceShutdown();
      }
    };
    return {
      definition: controllerPackage.plugin.GRPCController.service,
      implementation,
    };
  };
};

module.exports = {
  createControllerService,
};