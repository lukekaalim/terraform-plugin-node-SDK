// @flow strict
const { Unknown } = require('@lukekaalim/terraform-service');

const toUnknown = /*:: <T>*/(value/*: mixed*/, cast/*: mixed => T*/)/*: T | Unknown*/ => {
  if (value instanceof Unknown)
    return value;
  return cast(value);
}

const mapObjectEntries = /*:: <A: {}, R: {}>*/(
  a/*: A*/,
  mapFunction/*: (entry: [$Keys<A>, $Values<A>], index: number) => [$Keys<R>, $Values<R>]*/,
)/*: R*/ => {
  const entries/*: any*/ = Object.entries(a);
  const mappedEntries = entries.map(mapFunction);
  const mappedObject/*: any*/ = Object.fromEntries(mappedEntries);
  return mappedObject;
};

module.exports = {
  toUnknown,
  mapObjectEntries,
}