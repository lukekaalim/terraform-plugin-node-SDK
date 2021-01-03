// @flow strict
/*:: import type { GRPCServiceImplementationMap, GRPCServiceDefinition } from '@grpc/grpc-js'; */
/*:: import type { GRPCUnaryHandler, GRPCServerStreamHandler } from '@grpc/grpc-js'; */
/*:: import type { ConsoleLike } from 'console'; */
/*:: import type { Service } from '../services'; */

const { load } = require('@grpc/proto-loader');
const { loadPackageDefinition } = require('@grpc/grpc-js');
const { join } = require('path');

const createHealthcheckService = async (
  console/*: ConsoleLike*/
)/*: Promise<Service>*/ => {
  const healthcheckProto = await load(join(__dirname, './healthcheck.proto'));
  const healthCheckPackage = loadPackageDefinition(healthcheckProto);
  const definition = healthCheckPackage.grpc.health.v1.Health.service;

  const check/*: GRPCUnaryHandler*/ = (_, callback) => {
    callback(null, { status: 'SERVING' });
  };

  const watch/*: GRPCServerStreamHandler*/ = (stream) => {
    stream.write({ status: 'SERVING' });
    stream.end();
  };

  const implementation = {
    check,
    watch
  };

  console.log('Created Healthcheck Service');
  return { definition, implementation };
};

module.exports = {
  createHealthcheckService
};