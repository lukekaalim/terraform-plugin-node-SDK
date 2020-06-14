const { createGoPluginServer } = require('../go-plugin');
const { createTerraformService, handshake } = require('../terraform-plugin');
const { createFileLogger, setGlobalConsole } = require('../logger');

const resourceToSchema = (resource) => ({
  version: resource.version,
  block: resource.schema,
});

const createPlugin = (provider, resources) => {
  let configuredProvider = null;

  const resourceMap = new Map(resources.map((resource) => [resource.name, resource]));
  const resourceSchemas = Object.fromEntries(resources.map((resource) => [resource.name, resourceToSchema(resource)]));

  const schema = {
    provider: {
      version: provider.version,
      block: provider.schema
    },
    resourceSchemas,
    dataSourceSchemas: {}
  };

  const getSchema = async () => {
    return schema;
  };

  const validateDataSourceConfig = async (type, config) => {
    return;
  };

  const prepareProviderConfig = async (config) => {
    const preparedConfig = provider.prepare(config);
    return { preparedConfig };
  };

  const configure = async (terraformVersion, config) => {
    configuredProvider = provider.configure(config, terraformVersion);
    return;
  };

  const validateResourceTypeConfig = async (typeName, config) => {
    const resource = resourceMap.get(typeName);
    const diagnostics = await resource.validate(configuredProvider, config);
    return { diagnostics };
  };

  const readResource = async (typeName, state) => {
    const resource = resourceMap.get(typeName);
    const newState = await resource.read(configuredProvider, state);
    return { newState };
  };
  const planResourceChange = async (typeName, config, currentState, proposedNewState) => {
    const resource = resourceMap.get(typeName);
    const plannedState = await resource.plan(configuredProvider, config, currentState, proposedNewState);
    return { plannedState, requiresReplace: [] };
  };
  const applyResourceChange = async (typeName, config, currentState, plannedState) => {
    const resource = resourceMap.get(typeName);
    const newState = await resource.apply(configuredProvider, config, currentState, plannedState);
    return { newState };
  };
  const upgradeResourceState = async (typeName, version, state) => {
    const resource = resourceMap.get(typeName);
    const upgradedState = await resource.upgrade(configuredProvider, version, state);
    return { upgradedState };
  };
  const importResourceState = async (typeName, id) => {
    const resource = resourceMap.get(typeName);
    return { importedResources: [] };
  };
  const readDataSource = async (typeName, config) => {
    return { state: config };
  };
  const stop = async () => {
    return;
  };

  const run = async () => {
    const logger = createFileLogger('./grpc.log')
    try {
      const terraformService = await createTerraformService({
        getSchema,
        validateResourceTypeConfig,
        validateDataSourceConfig,
        prepareProviderConfig,
        configure,
        readResource,
        planResourceChange,
        applyResourceChange,
        upgradeResourceState,
        importResourceState,
        readDataSource,
        stop,
      });
      const pluginServer = createGoPluginServer(handshake, [terraformService], logger);
    } catch (error) { 
      console.error(error);
    }
  };

  return {
    run,
  };
};

module.exports = {
  createPlugin,
};