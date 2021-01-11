// @flow strict
/*:: import type { Schema, Block, NestedBlock, Attribute, Diagnostic, StringKind, Type } from '@lukekaalim/terraform-service'; */
const { marshal } = require('@lukekaalim/terraform-service');

/*::
export type SimpleAttributeMap = { [attributeName: string]: Type };
*/
const createAttributesFromMap = (map/*: SimpleAttributeMap*/)/*: Attribute[]*/ => (
  Object.entries(map)
    .map(([name, type]/*: [string, any]*/) =>
      createAttribute({ name, type: marshal(type) }))
);

/*::
export type AttributeArgs = {
  name: string,
  type: Buffer,
  required?: boolean,
  optional?: boolean,
  computed?: boolean,
  deprecated?: boolean,
  sensitive?: boolean,
  description?: string,
  descriptionKind?: 0 | 1,
};

*/
const createAttribute = ({
  name,
  type,
  required = false,
  optional = false,
  computed = false,
  deprecated = false,
  sensitive = false,
  description = '',
  descriptionKind = 0
}/*: AttributeArgs*/)/*: Attribute*/ => {
  return {
    name,
    type,
    required,
    optional,
    computed,
    deprecated,
    sensitive,
    description,
    descriptionKind
  };
};

module.exports = {
  createAttribute,
  createAttributesFromMap,
}