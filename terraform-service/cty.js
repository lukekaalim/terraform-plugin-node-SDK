// @flow strict

/*::
export opaque type Type =
  | string
  | (string | { [prop: string]: Type } | Type)[]
*/
const string/*: Type*/ = 'string';
const number/*: Type*/ = 'number';
const boolean/*: Type*/ = 'bool';

// Types
const object = (props/*: { [string]: Type }*/)/*: Type*/ =>
  ['object', props];
const list = (element/*: Type*/)/*: Type*/ =>
  ['list', element];
const map = (element/*: Type*/)/*: Type*/ =>
  ['map', element];
const set = (element/*: Type*/)/*: Type*/ =>
  ['set', element];
const tuple = (elementTypes/*: Type[]*/)/*: Type*/ =>
  ['tuple', ...elementTypes];

const types = {
  string,
  number,
  boolean,
  set,
  object,
  list,
  map,
  tuple,
};

const marshal = (type/*: Type*/)/*: Buffer*/ =>
  Buffer.from(JSON.stringify(type));

module.exports = {
  marshal,
  types,
};
