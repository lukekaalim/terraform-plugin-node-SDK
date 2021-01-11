// @flow strict

/*:: import type { DynamicValue } from './dynamicValue'; */
/*:: import type { Diagnostic } from './diagnostic'; */
/*:: import type { AttributePath } from './attributePath'; */
/*:: import type { Schema } from './schema'; */

/*:: import type {
  GetSchema,
  PrepareProviderConfig,
  ReadResource,
  PlanResource,
  ApplyResource,
  ValidateResourceTypeConfig,
} from './handlers'; */

/*::
export type Options = {
  // Information about what a provider supports/expects
  getSchema: GetSchema,
  prepareProviderConfig: PrepareProviderConfig,
  validateResourceTypeConfig: ValidateResourceTypeConfig,
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
  readResource: ReadResource,
  planResourceChange: PlanResource,
  applyResourceChange: ApplyResource,

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
