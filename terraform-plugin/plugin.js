// @flow strict
/*:: import type { Provider } from './provider'; */
/*:: import type { Resource } from './resource'; */

const { createTerraformService, setPackedDynamicValue, getDynamicValue, createDiagnosticFromError } = require('@lukekaalim/terraform-service');
const { createGOPluginServer, MagicCookieError } = require('@lukekaalim/hashicorp-go-plugin');

/*::
export type TerraformSDKPlugin = {
  start: () => Promise<void>,
};
*/

const createPlugin = /*::<T>*/(provider/*: Provider*/)/*: TerraformSDKPlugin*/ => {
  let configuredProvider/*: ?T*/;
  let providerIsConfigured = false;

  const getResource = (typeName) => {
    const [providerName, resourceName] = typeName.split('_', 2);
    const resource = provider.resources.find(r => r.name === resourceName);
    if (!resource)
      throw new Error(
        `Couldn't find ${typeName} (${providerName}, ${resourceName}) out of ${provider.resources.map(r => r.name).join(' ')}`
      );
    return resource;
  };
  const getDataSource = (typeName) => {
    const [providerName, dataSourceName] = typeName.split('_', 2);
    const dataSource = provider.dataSources.find(d => d.name === dataSourceName);
    if (!dataSource)
      throw new Error(
        `Couldn't find ${typeName} (${providerName}, ${dataSourceName}) out of ${provider.dataSources.map(d => d.name).join(' ')}`
      );
    return dataSource;
  }
  const getConfiguredProvider = ()/*: T*/ => {
    if (!providerIsConfigured)
      throw new Error("Provider is not configured");
    return (configuredProvider/*: any*/);
  };

  const getSchema = async () => {
    return {
      provider: provider.schema,
      resourceSchemas: Object.fromEntries(provider.resources.map(resource => [
        `${provider.name}_${resource.name}`,
        resource.schema
      ])),
      dataSourceSchemas: Object.fromEntries(provider.dataSources.map(dataSource => [
        `${provider.name}_${dataSource.name}`,
        dataSource.schema
      ])),
      diagnostics: [],
    };
  };
  // #region 
  const prepareProviderConfig = async ({ config }) => {
    return {
      preparedConfig: config,
      diagnostics: [],
    }
  };
  const validateResourceTypeConfig = async ({ typeName, config }) => {
    try {
      const { validate } = getResource(typeName);
      await validate(config);
      return {};
    } catch (error) {
      return {
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };
  const validateDataSourceConfig = async ({ typeName, config }) => {
    try {
      const { validate } = getDataSource(typeName);
      await validate(config);
      return {};
    } catch (error) {
      return {
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };
  const upgradeResourceState = async ({ rawState, typeName, version }) => {
    const oldState = rawState.json
      ? JSON.parse(rawState.json.toString('utf-8'))
      : rawState.flatmap;
    
    if (!oldState)
      throw new Error('Missing previous state to upgrade');

    const { upgrade } = getResource(typeName);
    const newState = await upgrade(version, oldState);

    return {
      upgradedState: setPackedDynamicValue(newState),
      diagnostics: [],
    }
  };
  // #endregion

  const configure = async ({ config, terraformVersion }) => {
    const providerConfigFunc = provider.configure;
    if (!providerConfigFunc) {
      providerIsConfigured = true;
      return {};
    }
    const value = getDynamicValue(config);
    configuredProvider = await providerConfigFunc(value);
    providerIsConfigured = true;
    
    return {}
  };
  // #region Resource Lifecycle
  const readResource = async ({ typeName, currentState }) => {
    try {
      const { read } = getResource(typeName);
      if (!read)
        return { newState: currentState };
      
      const configuredProvider = getConfiguredProvider();
      const newState = setPackedDynamicValue(
        await read(getDynamicValue(currentState), configuredProvider)
      );
      return { newState };
    } catch (error) {
      return {
        newState: currentState,
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };
  const planResourceChange = async ({ typeName, config, priorState, proposedNewState }) => {
    try {
      const { plan } = getResource(typeName);
      if (!plan)
        return { plannedState: proposedNewState, requiresReplace: [] };
      const configuredProvider = getConfiguredProvider();
      const plannedState = setPackedDynamicValue(await plan(
        getDynamicValue(priorState),
        getDynamicValue(proposedNewState),
        configuredProvider,
      ));

      return { plannedState, requiresReplace: [] };
    } catch (error) {
      return {
        plannedState: proposedNewState,
        requiresReplace: [],
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };
  const applyResourceChange = async ({ typeName, config, plannedState, priorState }) => {
    try {
      const { apply } = getResource(typeName);
      if (!apply)
        return { newState: plannedState };
      const configuredProvider = getConfiguredProvider();
      const newState = setPackedDynamicValue(await apply(
        getDynamicValue(priorState),
        getDynamicValue(plannedState),
        configuredProvider,
      ));
      return {
        newState,
        requiresReplace: [],
      };
    } catch (error) {
      return {
        newState: setPackedDynamicValue(null),
        requiresReplace: [],
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };
  const importResourceState = async ({ typeName, id }) => {
    return {
      importedResource: [],
      diagnostics: [],
    }
  };
  // #endregion

  const readDataSource = async ({ typeName, config }) => {
    try {
      const { read } = getDataSource(typeName);
      const configuredProvider = getConfiguredProvider();
      const state = await read(getDynamicValue(config), configuredProvider);
      return {
        state: setPackedDynamicValue(state),
      };
    } catch (error) {
      return {
        state: setPackedDynamicValue(null),
        diagnostics: [createDiagnosticFromError(error)]
      };
    }
  };

  const start = async () => {
    try {
      const goPlugin = await createGOPluginServer({
        pluginVersion: '5',
        magicCookieKey: 'TF_PLUGIN_MAGIC_COOKIE',
        magicCookieValue: 'd602bf8f470bc67ca7faa0386276bbdd4330efaf76d1a219cb4d6991ca9872b2'
      });
      const serviceOptions = {
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
      };
      const terraformService = await createTerraformService(goPlugin.console, goPlugin, serviceOptions);
      goPlugin.server.addService(terraformService.definition, terraformService.implementation);
  
      goPlugin.start();
    } catch (error) {
      if (error instanceof MagicCookieError) {
        console.log('Magic Cookie Mismatch Error');
        console.log('Did you invoke the plugin directly? It should be installed and invoked only by the terraform binary.')
      } else {
        console.error(error);
      }
      process.exit(1);
    }
  };

  return {
    start,
  };
};

module.exports = {
  createPlugin,
};
