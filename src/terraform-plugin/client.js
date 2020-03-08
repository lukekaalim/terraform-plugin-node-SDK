const { createGoPluginClient } = require('../go-plugin/client');
const { handshake } = require('./handshake');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const protoLoader = require('@grpc/proto-loader');

const createTerraformPluginClient = async (pluginFilename) => {

  const terraformProto = protoLoader.loadSync(path.join(__dirname, './tfplugin5.proto'));
  const terraformPackage = grpc.loadPackageDefinition(terraformProto);

  const createClient = terraformPackage.tfplugin5.Provider;

  await createGoPluginClient(createClient, handshake, pluginFilename);
};

module.exports = {
  createTerraformPluginClient,
};
