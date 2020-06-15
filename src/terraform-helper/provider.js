const createProvider = ({
  name,
  version = 1,
  schema,
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