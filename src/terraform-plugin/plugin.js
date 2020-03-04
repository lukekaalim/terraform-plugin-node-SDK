const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const path = require('path');
const { console } = require('../console');

const terraformProto = protoLoader.loadSync(path.join(__dirname, './tfplugin5.proto'));
const terraformPackage = grpc.loadPackageDefinition(terraformProto);

const { createGoPluginServer, InvalidMagicCookieError } = require('../go-plugin/server');

const handshake = {
  ProtocolVersion: 5,
  MagicCookieKey: 'TF_PLUGIN_MAGIC_COOKIE',
  MagicCookieValue: 'd602bf8f470bc67ca7faa0386276bbdd4330efaf76d1a219cb4d6991ca9872b2'
};

const createTerraformPlugin = async () => {
  try {
    console.log('Creating terraform plugin!');

    const getSchema = (call, callback) => {
      console.log('callback stub!');
      callback(null, {});
    };

    const prepareProviderConfig = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const validateResourceTypeConfig = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const validateDataSourceConfig = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };
    
    const upgradeResourceState = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const configure = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const readResource = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };
    
    const planResourceChange = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const applyResourceChange = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const importResourceState = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const readDataSource = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };
    
    const stop = (call, callback) => {
      console.log('callback!');
      callback(null, {});
    };

    const server = await createGoPluginServer(handshake, (server) => {
      server.addService(terraformPackage.tfplugin5.Provider.service, {
        getSchema,
        prepareProviderConfig,
        validateResourceTypeConfig,
        validateDataSourceConfig,
        upgradeResourceState,
        configure,
        readResource,
        planResourceChange,
        applyResourceChange,
        importResourceState,
        readDataSource,
        stop,
      });
    }, '0.0.0.0:50051');

  } catch (err) {
    if (err instanceof InvalidMagicCookieError) {
      process.stdout.write('Looks like you tried to invoke the plugin manually.\nThis won\'t do anything, you should try running it through terraform instead.\n');
      return
    } else {
      console.error(err);
    }
  }
};

module.exports = {
  createTerraformPlugin,
};