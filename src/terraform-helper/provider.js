const createProvider = ({
  version = 1,
  schema,
  prepare = (config) => config,
  configure = (config) => null,
}) => ({
  version,
  schema,
  prepare,
  configure,
});

module.exports = {
  createProvider,
};