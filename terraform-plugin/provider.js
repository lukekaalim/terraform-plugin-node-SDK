// @flow strict
/*:: import type { Schema } from '@lukekaalim/terraform-service'; */
/*:: import type { Resource } from './resource'; */

/*::
export type Provider = {
  name: string,
  resources: Resource[],
  schema: Schema,
  configure: (config: any) => Promise<any>,
};

export type ProviderArgs = {
  ...Provider,
  configure?: $PropertyType<Provider, 'configure'>,
}
*/

const createProvider = ({
  name,
  resources,
  schema, 
  configure = async () => null,
}/*: ProviderArgs*/)/*: Provider*/ => {
  return {
    name,
    resources,
    schema,
    configure,
  };
};

module.exports = {
  createProvider,
};
