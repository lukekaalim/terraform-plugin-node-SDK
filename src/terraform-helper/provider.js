const { createSchema } = require('./schema');

const createProvider = ({
  name,
  version = 1,
  schema = createSchema({}),
  prepare = (config) => config,
  configure = (config) => null,
}) => ({
  name,
  version,
  schema,
  prepare,
  configure,
});

module.exports = {
  createProvider,
};