// @flow strict
/*:: import type { Schema } from './schema'; */
/*:: import type { Diagnostic } from './diagnostic'; */
/*:: import type { AttributePath } from './attributePath'; */
/*:: import type { DynamicValue } from './dynamicValue'; */

/*::
export type GetSchemaReturn = {
  provider: Schema,
  resourceSchemas: { [string]: Schema },
  dataSourceSchemas: { [string]: Schema },
  diagnostics?: Diagnostic[], 
};
export type GetSchema =
  () => Promise<GetSchemaReturn>;

export type PrepareProviderConfigArgs = {
  config: DynamicValue,
};
export type PrepareProviderConfigReturn = {
  preparedConfig: DynamicValue,
  diagnostics?: Diagnostic[], 
};
export type PrepareProviderConfig =
  (args: PrepareProviderConfigArgs) => Promise<PrepareProviderConfigReturn>;


export type ValidateResourceTypeConfigArgs = {
  typeName: string,
  config: DynamicValue,
};
export type ValidateResourceTypeConfigReturn = {
  diagnostics?: Diagnostic[], 
};

export type ValidateResourceTypeConfig =
  (args: ValidateResourceTypeConfigArgs) => Promise<ValidateResourceTypeConfigReturn>


export type ReadResourceArgs = {
  typeName: string,
  currentState: DynamicValue,
  private: Buffer,
  providerMeta: DynamicValue,
};
export type ReadResourceReturn = {
  newState: DynamicValue,
  diagnostics?: Diagnostic[],
  private?: Buffer,
}

export type ReadResource =
  (args: ReadResourceArgs) => Promise<ReadResourceReturn>;

export type PlanResourceArgs = {
  typeName: string,
  priorState: DynamicValue,
  proposedNewState: DynamicValue,
  config: DynamicValue,
  priorPrivate: Buffer,
  providerMeta: DynamicValue,
};
export type PlanResourceReturn = {
  plannedState: DynamicValue,
  requiresReplace: AttributePath[],
  plannedPrivate?: Buffer,
  diagnostics?: Diagnostic[],
};

export type PlanResource =
  (args: PlanResourceArgs) => Promise<PlanResourceReturn>;

export type ApplyResourceArgs = {
  typeName: string,
  priorState: DynamicValue,
  plannedState: DynamicValue,
  config: DynamicValue,
  plannedPrivate: Buffer,
  providerMeta: DynamicValue,
};
export type ApplyResourceReturn = {
  newState: DynamicValue,
  private?: Buffer,
  diagnostics?: Diagnostic[],
};

export type ApplyResource =
  (args: ApplyResourceArgs) => Promise<ApplyResourceReturn>;
*/