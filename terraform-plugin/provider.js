// @flow strict
/*:: import type { Schema } from '@lukekaalim/terraform-service'; */
/*:: import type { Resource } from './resource'; */
/*:: import type { DataSource } from './dataSource'; */

/*::
export type Provider = {
  name: string,
  resources: Resource[],
  dataSources: DataSource[],
  schema: Schema,
  configure: (config: any) => Promise<any>,
};

export type ProviderArgs = {
  ...Provider,
  resources?: $PropertyType<Provider, 'resources'>,
  dataSources?: $PropertyType<Provider, 'dataSources'>,
  configure?: $PropertyType<Provider, 'configure'>,
}
*/

const createProvider = ({
  name,
  schema, 
  resources = [],
  dataSources = [],
  configure = async () => null,
}/*: ProviderArgs*/)/*: Provider*/ => {
  return {
    name,
    schema,
    resources,
    dataSources,
    configure,
  };
};

module.exports = {
  createProvider,
};
