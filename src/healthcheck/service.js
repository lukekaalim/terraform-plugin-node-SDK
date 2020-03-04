const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const path = require('path');
const { console } = require('../console');

const healthcheckProto = protoLoader.loadSync(path.join(__dirname, './healthcheck.proto'));
const healthCheckPackage = grpc.loadPackageDefinition(healthcheckProto);

const addHealthcheckService = (server) => {
  const check = (call, callback) => {
    console.log('check', call);
    callback(null, { status: 'SERVING' });
  };

  const watch = (stream) => {
    console.log('watch', stream);
    stream.write({ status: 'SERVING' });
    stream.write({ status: 'SERVING' });
    stream.write({ status: 'SERVING' });
    stream.write({ status: 'SERVING' });
    stream.end();
  };

  server.addService(
    healthCheckPackage.grpc.health.v1.Health.service,
    {
      check,
      watch
    }
  );
};

module.exports = {
  addHealthcheckService
};