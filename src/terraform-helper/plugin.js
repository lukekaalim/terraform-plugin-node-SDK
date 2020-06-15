const { createGoPluginServer } = require('../go-plugin');
const { createTerraformService, handshake } = require('../terraform-plugin');
const { createFileLogger, setGlobalConsole } = require('../logger');
const { createUnknownValue } = require('./value')

const mapEntryValues = (array, mapFunc) => {
  return array.map(([name, value]) => [name, mapFunc(value)]);
};

// Terraform has a special value for 'computed' resources, the 'unknown' value.
// Ensure that attributes that are not populated are considered 'unknown' if they
// are computed.
const getUnknownState = (resource) => {
  const computedAttributes = resource.block.attributes.filter(attribute => attribute.computed);
  const unknownEntries = computedAttributes.map(attribute => [attribute.name, createUnknownValue()]);
  const unknownState = Object.fromEntries(unknownEntries);
  return unknownState;
};

// Ensure that only attributes listed in the resource are part of the
// state sent to terraform
const filterStateByAttributes = (resource, state) => {
  const attributeNames = resource.block.attributes.map(attribute => attribute.name);
  const stateEntries = Object.entries(state);
  const entriesInAttributes = stateEntries.filter(([name, value]) => attributeNames.includes(name));
  const filteredState = Object.fromEntries(entriesInAttributes);
  return filteredState;
};

const createPlugin = (provider, resources) => {
  let configuredProvider = null;

  const resourceEntries = resources.map((resource) => [`${provider.name}_${resource.name}`, resource]);
  const resourceMap = new Map(resourceEntries);
  const resourceSchemas = Object.fromEntries(resourceEntries);

  const schema = {
    provider: {
      version: provider.version,
      block: provider.schema
    },
    resourceSchemas,
    dataSourceSchemas: {}
  };

  const getSchema = async () => {
    console.log(schema);
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
    try {
      await resource.validate(configuredProvider, config);
      return {};
    } catch (error) {
      const diagnostics = createDiagnosticsFromError(error);
      return { diagnostics };
    }
  };

  const readResource = async (typeName, state) => {
    if (!state)
      return { newState: null };
    const resource = resourceMap.get(typeName);
    const newState = await resource.read(configuredProvider, state);
    return {
      newState: filterStateByAttributes(resource, newState)
    };
  };
  const planResourceChange = async (typeName, config, currentState, proposedNewState) => {
    const resource = resourceMap.get(typeName);
    try {
      const plannedState = {
        ...getUnknownState(resource),
        ...await resource.plan(configuredProvider, currentState, config, proposedNewState),
      };
      return {
        plannedState: filterStateByAttributes(resource, plannedState),
        requiresReplace: []
      };
    } catch (error) {
      const diagnostics = createDiagnosticsFromError(error);
      return { diagnostics };
    }
  };
  const applyResourceChange = async (typeName, config, state, plan) => {
    const resource = resourceMap.get(typeName);
    let newState;

    try {
      if (!plan) {
        newState = await resource.delete(configuredProvider, state, plan);
      } else if (!state) {
        newState = await resource.create(configuredProvider, config, plan);
      } else {
        newState = await resource.update(configuredProvider, state, config, plan);
      }

      return {
        newState: filterStateByAttributes(resource, newState),
      };
    } catch (error) {
      const diagnostics = createDiagnosticsFromError(error);
      return { diagnostics };
    }
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
      });
      const pluginServer = await createGoPluginServer(handshake, [terraformService], logger);
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