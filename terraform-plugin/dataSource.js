// @flow strict
/*:: import type { Schema } from '@lukekaalim/terraform-service'; */

/*::
export type DataSource = {
  schema: Schema,
  name: string,
  read(config: any, provider: any): Promise<any>,
  validate(config: any): Promise<void>,
};

export type DataSourceArgs = {
  ...DataSource,
  read?: $PropertyType<DataSource, 'read'>,
  validate?: $PropertyType<DataSource, 'validate'>,
};
*/

const createDataSource = ({
  name,
  schema,
  read = async (c, p) => c,
  validate = async (c) => {}, 
}/*: DataSourceArgs*/)/*: DataSource*/ => {
  return {
    name,
    schema,
    read,
    validate,
  }
};

module.exports = {
  createDataSource,
};
