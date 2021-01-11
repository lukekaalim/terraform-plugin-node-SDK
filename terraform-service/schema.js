// @flow strict

const stringKinds = {
  PLAIN: 0,
  MARKDOWN: 1,
};
/*::
export type StringKind = $Values<typeof stringKinds>;

export type Schema = {
  version: number,
  block: Block,
};

export type Block = {
  version: number,
  attributes: Attribute[],
  blockTypes: NestedBlock[],
  description: string,
  descriptionKind: StringKind,
  deprecated: boolean,
};

export type Attribute = {
  name: string,
  type: Buffer,
  description: string,
  required: boolean,
  optional: boolean,
  computed: boolean,
  sensitive: boolean,
  descriptionKind: StringKind,
  deprecated: boolean,
};
*/

const nestingModes = {
  INVALID: 0,
  SINGLE: 1,
  LIST: 2,
  SET: 3,
  MAP: 4,
  GROUP: 5,
}

/*::
export type NestingMode = $Values<typeof nestingModes>;
export type NestedBlock = {
  typeName: string,
  block: Block,
  nesting: NestingMode,
  minItems: number,
  maxItems: number,
};
*/

module.exports = {
  nestingModes,
  stringKinds,
};