const createAttribute = (name, type = 'string', description = '', attributeFlags = {}) => {
  const {
    required = false,
    optional = false,
    computed = false,
    sensitive = false,
  } = attributeFlags;

  return {
    name,
    // https://github.com/zclconf/go-cty/blob/master/docs/types.md
    type: Buffer.from(JSON.stringify(type)),
    description,
  
    required,
    optional,
    computed,
    sensitive,
  };
};

const createSchema = (version, attributes) => {
  return {
    version,
    attributes,
  };
};

module.exports = {
  createSchema,
  createAttribute,
};
