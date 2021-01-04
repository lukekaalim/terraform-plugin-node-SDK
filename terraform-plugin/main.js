// @flow strict
/*:: import type { Schema, Attribute as SchemaAttribute, Diagnostic } from '@lukekaalim/terraform-service'; */
/*:: import type { Type } from './type'; */
const { Unknown } = require('@lukekaalim/terraform-service');

/*::
export type RichText =
  | { type: 'markdown', content: string }
  | { type: 'plain', content: string };

export type Value =
  | null
  | string
  | number
  | boolean
  | { [name: string]: Value }
  | Value[];
export type Configuration = { +[name: string]: Value };
export type Plan = { +[name: string]: Unknown | Value };
export type State = { +[name: string]: Value };

export type Attribute = {|
  name: string,
  type: Type,
  description?: RichText,

  required?: boolean,
  optional?: boolean,
  computed?: boolean,
  sensitive?: boolean,

  deprecated?: boolean,
|};

export type Provider<ConfiguredProvider> = {
  name: string,
  resources: Resource<ConfiguredProvider>[],
  attributes: Attribute[],
  description?: RichText,
  configure?: (config: Configuration) => Promise<ConfiguredProvider>,
};

export type Resource<ConfiguredProvider> = {
  name: string,
  attributes: Attribute[],
  description?: RichText,
  plan?: (state: null | State, config: Configuration, provider: ConfiguredProvider) => Promise<Plan>,
  apply?: (state: null | State, plan: null | Plan, provider: ConfiguredProvider) => Promise<null | State>,
  read?: (state: State, provider: ConfiguredProvider) => Promise<State>,
  validate?: (config: Configuration) => Promise<boolean>,
  upgrade?: (config: Configuration) => Promise<Configuration>,
  import?: (id: string) => Promise<Configuration>,
};
*/


module.exports = {
  Unknown,
  ...require('./plugin'),
  ...require('./schema'),
  ...require('./type'),
  ...require('./utility'),
};

