const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const { createNullLogger } = require('../logger');
const { createGRPCService, createGRPCImplementation } = require('../grpc');

const stdioProtoFilePath = path.join(__dirname, './grpc_stdio.proto');

const createSTDIOService = async () => {
  const stdioProto = await protoLoader.load(stdioProtoFilePath);
  const stdioPackage = grpc.loadPackageDefinition(stdioProto);
  const implementation = {
    streamStdio: (call) => {}
  }
  return createGRPCService(stdioPackage.plugin.GRPCStdio.service, implementation);
};

module.exports = {
  createSTDIOService,
};