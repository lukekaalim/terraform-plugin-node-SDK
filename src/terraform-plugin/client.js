const { createGoPluginClient } = require('../go-plugin/client');
const { handshake } = require('./handshake');

const createTerraformPluginClient = async (pluginFilename) => {
  return await createGoPluginClient(handshake, pluginFilename);
};

module.exports = {
  createTerraformPluginClient,
};
