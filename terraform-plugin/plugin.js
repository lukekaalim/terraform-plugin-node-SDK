// @flow strict
/*:: import type { Provider } from './main'; */
const { createTerraformService, setPackedDynamicValue, getDynamicValue, Unknown } = require('@lukekaalim/terraform-service');
const { createGOPluginServer, MagicCookieError } = require('@lukekaalim/hashicorp-go-plugin');
const { providerToSchema, resourceToSchema, createErrorDiagnostic } = require('./schema');

/*::
export type TerraformSDKPlugin = {
  start: () => Promise<void>,
};
*/

const createPlugin = /*::<T>*/(provider/*: Provider<T>*/)/*: TerraformSDKPlugin*/ => {
  let configuredProvider/*: ?T*/;
  let providerIsConfigured = false;

  const getResource = (typeName) => {
    const [providerName, resourceName] = typeName.split('_', 2);
    const resource = provider.resources.find(r => r.name === resourceName);
    if (!resource)
      throw new Error();
    return resource;
  };
  const getConfiguredProvider = ()/*: T*/ => {
    if (!providerIsConfigured)
      throw new Error("Provider is not configured");
    return (configuredProvider/*: any*/);
  };

  const getSchema = async () => {
    return {
      provider: providerToSchema(provider),
      resourceSchemas: Object.fromEntries(provider.resources.map(resource => [
        `${provider.name}_${resource.name}`,
        resourceToSchema(resource)
      ])),
      dataSourceSchemas: {},
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
  const validateResourceTypeConfig = async () => {
    return {
      diagnostics: [],
    }
  };
  const validateDataSourceConfig = async () => {
    return {
      diagnostics: [],
    }
  };
  const upgradeResourceState = async ({ rawState, typeName }) => {
    if (!rawState.json)
      throw new Error('oops');
    return {
      upgradedState: setPackedDynamicValue(JSON.parse(rawState.json.toString())),
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
        diagnostics: [createErrorDiagnostic(error)]
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
        diagnostics: [createErrorDiagnostic(error)]
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
        newState: plannedState,
        requiresReplace: [],
        diagnostics: [createErrorDiagnostic(error)]
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
    return {
      state: config,
      diagnostics: [],
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
