// @flow strict
/*:: import type { ConsoleLike } from 'console'; */
/*:: import type { Options } from './options'; */
/*:: import type { GRPCServiceDefinition, GRPCServiceImplementationMap } from '@grpc/grpc-js'; */
const { load } = require('@grpc/proto-loader');
const { loadPackageDefinition } = require('@grpc/grpc-js');
const { join } = require('path');

const { createGRPCUnaryHandler } = require('./grpc');

/*::
export type Service = {
  definition: GRPCServiceDefinition,
  implementation: GRPCServiceImplementationMap,
};
*/

const createTerraformService = async (
  console/*: ConsoleLike*/,
  server/*: { close: () => Promise<void> }*/,
  options/*: Options*/
)/*: Promise<Service>*/ => {
  const terraformProto = await load(join(__dirname, './terraform.proto'));
  const terraformPackage = loadPackageDefinition(terraformProto);
  const definition = terraformPackage.tfplugin5.Provider.service;

  const getSchema = createGRPCUnaryHandler(options.getSchema);
  const prepareProviderConfig = createGRPCUnaryHandler(options.prepareProviderConfig);
  const validateResourceTypeConfig = createGRPCUnaryHandler(options.validateResourceTypeConfig);
  const validateDataSourceConfig = createGRPCUnaryHandler(options.validateDataSourceConfig);
  const upgradeResourceState = createGRPCUnaryHandler(options.upgradeResourceState);

  const configure = createGRPCUnaryHandler(options.configure);

  const readResource = createGRPCUnaryHandler(options.readResource);
  const planResourceChange = createGRPCUnaryHandler(options.planResourceChange);
  const applyResourceChange = createGRPCUnaryHandler(options.applyResourceChange);
  const importResourceState = createGRPCUnaryHandler(options.importResourceState);

  const readDataSource = createGRPCUnaryHandler(options.readDataSource);
  const stop = createGRPCUnaryHandler(async () => {
    await server.close();
    return { Error: '' };
  });

  const implementation = {
    getSchema,
    prepareProviderConfig,
    validateResourceTypeConfig,
    validateDataSourceConfig,
    upgradeResourceState,

    configure,

    readResource,
    planResourceChange,
    applyResourceChange,
    importResourceState,

    readDataSource,
    stop,
  };
  console.log('Created Terraform Service');
  return { definition, implementation };
};

module.exports = {
  createTerraformService,
};
