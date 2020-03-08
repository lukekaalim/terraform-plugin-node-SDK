const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const path = require('path');
const { console } = require('../console');
const msgpack = require('msgpack');

const { handshake } = require('./handshake');

const terraformProto = protoLoader.loadSync(path.join(__dirname, './tfplugin5.proto'));
const terraformPackage = grpc.loadPackageDefinition(terraformProto);

const { createGoPluginServer, InvalidMagicCookieError } = require('../go-plugin/server');

const createTerraformPluginServer = async () => {
  try {
    console.log('Creating terraform plugin!');

    const getSchema = (call, callback) => {
      console.log('getSchema callback');

      const provider = {
        version: 1,
        block: {
          version: 1,
          attributes: [
            { name: 'dave', type: '' }
          ],
          block_types: [],
        },
      };
      const resource_schemas = {

      };
      const data_source_schemas = {

      };
      const diagnostics = [];

      callback(null, {
        provider,
        resource_schemas,
        data_source_schemas,
        diagnostics,
      });
    };

    const prepareProviderConfig = (call, callback) => {
      try {
        console.log('prepareProviderConfig callback');
        console.log(call.request);
        console.log('pack:', msgpack.unpack(call.request.config.msgpack));
  
        callback(null, {
          prepared_config: {
            msgpack: Buffer.from(''),
            json: Buffer.from(''),
          },
          diagnostics: [],
        });
      } catch (err) {
        console.error(err);
        callback('funcky error!')
      }
    };

    const validateResourceTypeConfig = (call, callback) => {
      console.log('validateResourceTypeConfig callback!');
      callback(null, {});
    };

    const validateDataSourceConfig = (call, callback) => {
      console.log('validateDataSourceConfig callback!');
      callback(null, {});
    };
    
    const upgradeResourceState = (call, callback) => {
      console.log('upgradeResourceState callback!');
      callback(null, {});
    };

    const configure = (call, callback) => {
      console.log('configure callback!');
      callback(null, {});
    };

    const readResource = (call, callback) => {
      console.log('readResource callback!');
      callback(null, {});
    };
    
    const planResourceChange = (call, callback) => {
      console.log('planResourceChange callback!');
      callback(null, {});
    };

    const applyResourceChange = (call, callback) => {
      console.log('applyResourceChange callback!');
      callback(null, {});
    };

    const importResourceState = (call, callback) => {
      console.log('importResourceState callback!');
      callback(null, {});
    };

    const readDataSource = (call, callback) => {
      console.log('readDataSource callback!');
      callback(null, {});
    };
    
    const stop = (call, callback) => {
      console.log('stop callback!');
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
    });

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
  createTerraformPluginServer,
};