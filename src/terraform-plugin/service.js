const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const path = require('path');

const { createNullLogger } = require('../logger');
const { createGRPCService, createGRPCImplementation } = require('../grpc');
const { setPackedDynamicValue, getDynamicValue } = require('./dynamicValue');

const terraformProtoFilePath = path.join(__dirname, './tfplugin5.proto');

const createTerraformService = async ({
  //! () => { provider, resourceSchemas, dataSourceSchemas, diagnostics }
  getSchema,

  //! (typeName, config) => { diagnostics }
  validateResourceTypeConfig,
  //! (typeName, config) => { diagnostics }
  validateDataSourceConfig,

  //! config => { preparedConfig, diagnostics }
  prepareProviderConfig,
  //! config => { diagnostics }
  configure,

  //! (typeName, state) => { newState, diagnostics }
  readResource,
  //! (typeName, config, priorState, proposedNewState) => { plannedState, requiresReplace, diagnostics }
  planResourceChange,
  //! (typeName, config, priorStateValue, plannedState) => { newState, diagnostics }
  applyResourceChange,

  //! (typeName, version, state) => { upgradedState, diagnostics }
  upgradeResourceState,
  //! (typeName, id) => { importedResources, diagnostics }
  importResourceState,

  //! (typeName, config) => { state, diagnostics }
  readDataSource,

  //! () => { error }
  stop,
}) => {
  const terraformProto = await protoLoader.load(terraformProtoFilePath);
  const terraformPackage = grpc.loadPackageDefinition(terraformProto);
  const implementation = {
    getSchema: createGRPCImplementation(async () => {
      const { provider, resourceSchemas = {}, dataSourceSchemas = {}, diagnostics = [] } = await getSchema() || {};
      return {
        provider,
        resourceSchemas,
        dataSourceSchemas,
        diagnostics,
      };
    }),
    // Run for 'init'
    prepareProviderConfig: createGRPCImplementation(async ({ config }) => {
      const configValue = getDynamicValue(config);
      const { preparedConfig, diagnostics = [] } = await prepareProviderConfig(configValue) || {};
      return {
        preparedConfig: setPackedDynamicValue(preparedConfig),
        diagnostics,
      };
    }),
    // Run for 'validate'
    validateResourceTypeConfig: createGRPCImplementation(async ({ typeName, config }) => {
      const configValue = getDynamicValue(config);
      const { diagnostics = [] } = await validateResourceTypeConfig(typeName, configValue) || {};
      return {
        diagnostics,
      };
    }),
    validateDataSourceConfig: createGRPCImplementation(async ({ typeName, config }) => {
      const configValue = getDynamicValue(config);
      const { diagnostics = [] } = await validateDataSourceConfig(typeName, configValue) || {};
      return {
        diagnostics,
      };
    }),
    // Run before reading resources
    upgradeResourceState: createGRPCImplementation(async ({ typeName, version, rawState }) => {
      const state = JSON.parse(rawState.json.toString('utf-8'))
      const { upgradedState, diagnostics = [] } = await upgradeResourceState(typeName, version, state) || {};
      return {
        upgradedState: setPackedDynamicValue(upgradedState),
        diagnostics,
      };
    }),
    // Run before any read or write
    configure: createGRPCImplementation(async ({ terraformVersion, config }) => {
      const configValue = getDynamicValue(config);
      const { diagnostics = [] } = await configure(terraformVersion, configValue) || {};
      return {
        diagnostics,
      };
    }),
    readResource: createGRPCImplementation(async ({ typeName, currentState }) => {
      const currentStateValue = getDynamicValue(currentState);
      const { newState, diagnostics = [] } = await readResource(typeName, currentStateValue) || {};
      return {
        newState: setPackedDynamicValue(newState),
        diagnostics,
      };
    }),
    planResourceChange: createGRPCImplementation(async ({ typeName, priorState, proposedNewState, config }) => {
      const configValue = getDynamicValue(config);
      const priorStateValue = getDynamicValue(priorState);
      const proposedNewStateValue = getDynamicValue(proposedNewState);

      const { plannedState, requiresReplace = [], diagnostics = [] } = await planResourceChange(
        typeName,
        configValue,
        priorStateValue,
        proposedNewStateValue
      ) || {};
    
      return {
        plannedState: setPackedDynamicValue(plannedState),
        requiresReplace,
        diagnostics,
      };
    }),
    applyResourceChange: createGRPCImplementation(async ({ typeName, priorState, plannedState, config }) => {
      const configValue = getDynamicValue(config);
      const priorStateValue = getDynamicValue(priorState);
      const plannedStateValue = getDynamicValue(plannedState);

      const { newState, diagnostics = [] } = await applyResourceChange(
        typeName,
        configValue,
        priorStateValue,
        plannedStateValue
      ) || {};

      return {
        newState: setPackedDynamicValue(newState),
        diagnostics,
      };
    }),

    importResourceState: createGRPCImplementation(async ({ typeName, id }) => {
      const { importedResources, diagnostics = [] } = await importResourceState(typeName, id) || {};
      return {
        importedResources: importedResources.map(resource => {
          return {
            typeName: resource.typeName,
            state: setPackedDynamicValue(resource.state),
          }
        }),
        diagnostics,
      };
    }),
    readDataSource: createGRPCImplementation(async ({ typeName, config }) => {
      const configValue = getDynamicValue(config);
      const { state, diagnostics = [] } = await importResourceState(typeName, configValue) || {};
      return {
        state: setPackedDynamicValue(state),
        diagnostics,
      };
    }),

    stop: createGRPCImplementation(async () => {
      const { error = null } = await stop() || {};
      return {
        Error: error,
      };
    })
  };

  return createGRPCService(terraformPackage.tfplugin5.Provider.service, implementation);
};

module.exports = {
  createTerraformService,
};