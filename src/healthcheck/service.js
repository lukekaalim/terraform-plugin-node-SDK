const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const { createGRPCService } = require('../grpc/service');

const healthcheckProtoFilePath = path.join(__dirname, './healthcheck.proto');

const createHealthcheckService = async () => {
  const healthcheckProto = await protoLoader.load(healthcheckProtoFilePath);
  const healthCheckPackage = grpc.loadPackageDefinition(healthcheckProto);

  const check = (call, callback) => {
    callback(null, { status: 'SERVING' });
  };

  const watch = (stream) => {
    stream.write({ status: 'SERVING' });
    stream.end();
  };

  const implementation = {
    check,
    watch
  };

  return createGRPCService(
    healthCheckPackage.grpc.health.v1.Health.service,
    implementation
  );
};

module.exports = {
  createHealthcheckService
};