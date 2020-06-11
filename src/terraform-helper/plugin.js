const { createGoPluginServer } = require('../go-plugin');
const { createTerraformService, handshake } = require('../terraform-plugin');
const { createFileLogger, setGlobalConsole } = require('../logger');

const resourcesToSchemas = (resources) => {
  const resourceEntries = resources.map(resource => {
    return [resource.name, {
      block: resource.schemaBlock,
      version: resource.version
    }];
  });
  
  const resourceSchemas = Object.fromEntries(resourceEntries);
  return resourceSchemas;
};

const createPlugin = (provider, resources) => {
  let providerResult = null;

  const resourceSchemas = resourcesToSchemas(resources);

  const schema = {
    provider: {
      version: provider.version,
      block: provider.schemaBlock
    },
    resourceSchemas,
    dataSourceSchemas: {}
  };

  const getSchema = async () => {
    return schema;
  };

  const validateResourceTypeConfig = async (type, config) => {
    return;
  };

  const validateDataSourceConfig = async (type, config) => {
    return;
  };

  const prepareProviderConfig = async (config) => {
    return { preparedConfig: config };
  };

  const configure = async (config) => {
    return;
  };

  const readResource = async (typeName, state) => {
    return { newState: state };
  };
  const planResourceChange = async (typeName, config, priorState, proposedNewState) => {
    return { plannedState: proposedNewState, requiresReplace: [] };
  };
  const applyResourceChange = async (typeName, config, currentState, plannedState) => {
    return { newState: plannedState };
  };
  const upgradeResourceState = async (typeName, version, state) => {
    return { upgradedState: state };
  };
  const importResourceState = async (typeName, id) => {
    return { importedResources: [] };
  };
  const readDataSource = async (typeName, config) => {
    return { state: config };
  };
  const stop = async () => {
    return;
  };

  const run = async () => {
    const logger = createFileLogger('./tf.log');
    setGlobalConsole(logger);
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
      logger.error(error);
    }
  };

  return {
    run,
  };
};

module.exports = {
  createPlugin,
};