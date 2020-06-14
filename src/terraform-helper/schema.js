const createAttribute = ({
  name,
  type = 'string',
  description = '',
  required = false,
  optional = true,
  computed = false,
  sensitive = false,
}) => {

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

const createSchema = (attributes, version = 1) => {
  return {
    version,
    attributes,
  };
};

module.exports = {
  createSchema,
  createAttribute,
};
