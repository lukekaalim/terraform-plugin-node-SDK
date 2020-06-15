// https://github.com/zclconf/go-cty/blob/master/docs/types.md
const types = {
  string: 'string',
  number: 'number',
  bool: 'bool',
  object: propertyMap => [
    'object',
    propertyMap,
  ],
  list: elementType => [
    'list',
    elementType,
  ]
}

const createSchema = (attributeMap, version = 1) => {
  const attributeEntries = Object.entries(attributeMap);
  const attributes = attributeEntries.map(([name, attribute]) => ({
    name,
    type: Buffer.from(JSON.stringify(attribute.type)),
    description: attribute.description,

    required: attribute.required,
    optional: attribute.optional,
    computed: attribute.computed,
    sensitive: attribute.sensitive,
  }));
  return {
    version,
    attributes,
  };
}

module.exports = {
  createSchema,
  types,
};
