const createProvider = (version, schemaBlock) => {
  return {
    version,
    schemaBlock,
  };
};

module.exports = {
  createProvider,
};