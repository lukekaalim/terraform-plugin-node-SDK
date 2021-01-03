// @flow strict
/*:: import type { GRPCServiceImplementationMap, GRPCServiceDefinition } from '@grpc/grpc-js'; */
/*:: import type { GRPCUnaryHandler, GRPCServerCall } from '@grpc/grpc-js'; */
/*:: import type { ConsoleLike } from 'console'; */
/*:: import type { DynamicValue } from './dynamicValue'; */

/*::
type Service = {
  definition: GRPCServiceDefinition,
  implementation: GRPCServiceImplementationMap,
};
*/

const { load } = require('@grpc/proto-loader');
const { loadPackageDefinition } = require('@grpc/grpc-js');
const { join } = require('path');

/*::
export type AttributePath = {
  steps: ({
    selector:
      | { attributeName: string }
      | { elementKeyString: string }
      | { elementKeyInt: number }
  })[]
};

export type Diagnostic = {
  severity: 0 | 1 | 2,
  summary: string,
  detail: string,
  attribute: AttributePath
}

export type Attribute = {
  name: string,
  type: Buffer,
  description: string,
  required: boolean,
  optional: boolean,
  computed: boolean,
  sensitive: boolean,
  descriptionKind: 0 | 1,
  deprecated: boolean,
};

export type NestedBlock = {
  typeName: string,
  block: Block,
  nesting: number,
  minItems: number,
  maxItems: number,
};

export type Block = {
  version: number,
  attributes: Attribute[],
  blockTypes: NestedBlock[],
  description: string,
  descriptionKind: 0 | 1,
  deprecated: boolean,
};

export type Schema = {
  version: number,
  block: Block,
};
*/

/*::
export type GetSchema = () => Promise<{
  provider: Schema,
  resourceSchemas: { [string]: Schema },
  dataSourceSchemas: { [string]: Schema },
  diagnostics?: Diagnostic[], 
}>;
export type PrepareProviderConfig = ({
  config: DynamicValue
}) => Promise<{
  preparedConfig: DynamicValue,
  diagnostics: Diagnostic[], 
}>;

export type TerraformServiceOptions = {
  // Information about what a provider supports/expects
  getSchema: GetSchema,
  prepareProviderConfig: PrepareProviderConfig,
  validateResourceTypeConfig: ({
    typeName: string,
    config: DynamicValue,
  }) => Promise<{
    diagnostics?: Diagnostic[], 
  }>,
  validateDataSourceConfig: ({
    typeName: string,
    config: DynamicValue,
  }) => Promise<{
    diagnostics?: Diagnostic[],
  }>,
  upgradeResourceState: ({
    typeName: string,
    version: number,
    rawState: {
      json: ?Buffer,
      flatmap: ?{ [name: string]: string },
    }
  }) => Promise<{
    upgradedState: DynamicValue,
    diagnostics?: Diagnostic[],
  }>,

  // One-time initialization, called before other functions below
  configure: ({
    terraformVersion: string,
    config: DynamicValue
  }) => Promise<{
    diagnostics?: Diagnostic[],
  }>,

  // Managed Resource Lifecycle
  readResource: ({
    typeName: string,
    currentState: DynamicValue,
    private: Buffer,
    providerMeta: DynamicValue,
  }) => Promise<{
    newState: DynamicValue,
    diagnostics?: Diagnostic[],
    private?: Buffer,
  }>,
  planResourceChange: ({
    typeName: string,
    priorState: DynamicValue,
    proposedNewState: DynamicValue,
    config: DynamicValue,
    priorPrivate: Buffer,
    providerMeta: DynamicValue,
  }) => Promise<{
    plannedState: DynamicValue,
    requiresReplace: AttributePath[],
    plannedPrivate?: Buffer,
    diagnostics?: Diagnostic[],
  }>,
  applyResourceChange: ({
    typeName: string,
    priorState: DynamicValue,
    plannedState: DynamicValue,
    config: DynamicValue,
    plannedPrivate: Buffer,
    providerMeta: DynamicValue,
  }) => Promise<{
    newState: DynamicValue,
    private?: Buffer,
    diagnostics?: Diagnostic[],
  }>,
  importResourceState: ({
    typeName: string,
    id: string,
  }) => Promise<{
    importedResource: ({
      typeName: string,
      state: DynamicValue,
      private: Buffer,
    })[],
    diagnostics?: Diagnostic[],
  }>,

  readDataSource: ({
    typeName: string,
    config: DynamicValue,
    providerMeta: DynamicValue,
  }) => Promise<{
    state: DynamicValue,
    diagnostics?: Diagnostic[],
  }>,
};
*/

const createGRPCUnaryHandler = (
  asyncHandler/*: any => Promise<any>*/
)/*: GRPCUnaryHandler*/ => async (
  call,
  callback
)/*: Promise<void>*/ => {
  try {
    callback(null, await asyncHandler(call.request));
  } catch (error) {
    callback(error);
  }
};

const createTerraformService = async (
  console/*: ConsoleLike*/,
  server/*: { close: () => Promise<void> }*/,
  options/*: TerraformServiceOptions*/
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
  const stop/*: GRPCUnaryHandler*/ = async (call, callback) => {
    callback(null, { Error: '' });
    await server.close();
  }

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
  ...require('./dynamicValue'),
};
