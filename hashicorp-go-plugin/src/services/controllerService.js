// @flow strict
/*:: import type { GRPCServiceImplementationMap, GRPCServiceDefinition } from '@grpc/grpc-js'; */
/*:: import type { GRPCUnaryHandler, GRPCServerStreamHandler, Server } from '@grpc/grpc-js'; */
/*:: import type { ConsoleLike } from 'console'; */
/*:: import type { Service } from '../services'; */
/*:: import type { GoPluginServer } from '../server'; */

const { load } = require('@grpc/proto-loader');
const { loadPackageDefinition } = require('@grpc/grpc-js');
const path = require('path');

const createControllerService = async (
  console/*: ConsoleLike*/,
  server/*: GoPluginServer*/,
)/*: Promise<Service>*/ => {
  const controllerProto = await load(path.join(__dirname, './controller.proto'));
  const controllerPackage = loadPackageDefinition(controllerProto);
  const definition = controllerPackage.plugin.GRPCController.service;

  const shutdown = () => {
    console.log("Shutting down");
    server.close();
  }

  const implementation = {
    shutdown,
  };
  console.log('Created Controller Service');
  return { definition, implementation };
};

module.exports = {
  createControllerService,
};