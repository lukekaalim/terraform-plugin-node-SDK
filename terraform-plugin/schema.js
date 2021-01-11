// @flow strict
/*:: import type { Schema, Block, NestedBlock, Attribute, Diagnostic, StringKind, Type } from '@lukekaalim/terraform-service'; */
/*:: import type { SimpleAttributeMap } from './attribute'; */
const { types } = require('@lukekaalim/terraform-service');
const { createAttributesFromMap } = require('./attribute');
/*::
export type SimpleSchemaArgs = {
  required?: SimpleAttributeMap,
  computed?: SimpleAttributeMap,
};
*/

const createSimpleSchema = ({ required = {}, computed = {} }/*: SimpleSchemaArgs*/)/*: Schema*/ => {
  return createSchema({
    block: createBlock({
      attributes: [
        ...createAttributesFromMap(required).map(a => ({ ...a, required: true })),
        ...createAttributesFromMap(computed).map(a => ({ ...a, computed: true })),
      ],
    })
  })
};

/*::
export type BlockArgs = {
  attributes?: Attribute[],
  blockTypes?: NestedBlock[],
  deprecated?: boolean,
  descriptionKind?: StringKind,
  description?: string,
  version?: number,
};
*/

const createBlock = ({
  attributes = [],
  blockTypes = [],
  deprecated = false,
  description = '',
  descriptionKind = 0,
  version = 0,
}/*: BlockArgs*/)/*: Block*/ => {
  return {
    attributes,
    blockTypes,
    deprecated,
    description,
    descriptionKind,
    version,
  };
};


/*::
export type SchemaArgs = {
  block: Block,
  version?: number
};
*/
const createSchema = ({ block, version = 1 }/*: SchemaArgs*/)/*: Schema*/ => {
  return {
    block,
    version,
  }
};

module.exports = {
  createSimpleSchema,
  createSchema,
  createBlock,
};
