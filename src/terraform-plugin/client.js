const { createGoPluginClient } = require('../go-plugin/client');
const { handshake } = require('./handshake');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const protoLoader = require('@grpc/proto-loader');

const createTerraformPluginClient = async (pluginFilename) => {

  const terraformProto = protoLoader.loadSync(path.join(__dirname, './tfplugin5.proto'));
  const terraformPackage = grpc.loadPackageDefinition(terraformProto);

  const createClient = terraformPackage.tfplugin5.Provider;

  console.log('go plugin creating')
  const client = await createGoPluginClient(createClient, handshake, pluginFilename);
  console.log('go plugin created')
  return client;
};

module.exports = {
  createTerraformPluginClient,
};
