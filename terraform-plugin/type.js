// @flow strict

/*::
export type Type =
  | 'string'
  | 'number'
  | 'bool'
  | ['object', { [propertyName: string]: Type }]
  | ['array', Type]
*/
const string/*: Type*/ = 'string';
const number/*: Type*/ = 'number';
const boolean/*: Type*/ = 'bool';

// Types
const object = (props/*: { [string]: Type }*/)/*: Type*/ =>
  ['object', props];
const array = (element/*: Type*/)/*: Type*/ =>
  ['array', element];

const types = {
  string,
  number,
  boolean,
  object,
  array,
};

module.exports = {
  types,
};
