const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const path = require('path');
const { console } = require('../console');
const msgpack = require('msgpack');

const { handshake } = require('./handshake');

const terraformProto = protoLoader.loadSync(path.join(__dirname, './tfplugin5.proto'));
const terraformPackage = grpc.loadPackageDefinition(terraformProto);

const { createGoPluginServer, InvalidMagicCookieError } = require('../go-plugin/server');

const getValueFromDynamicValue = (dynamicValue) => {
  if (dynamicValue.msgpack)
    return msgpack.unpack(dynamicValue.msgpack)
  throw new Error('I cant handle this!');
}

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
            { name: 'dave', type: Buffer.from(JSON.stringify('string')).toString('base64') }
          ],
          block_types: [],
        },
      };
      const resourceSchemas = {
        'example_cool_resource': {
          version: 1,
          block: {
            version: 1,
            attributes: [
              { name: 'dave', type: Buffer.from(JSON.stringify('string')).toString('base64') }
            ],
            block_types: [],
          },
        }
      };
      const dataSourceSchemas = {

      };
      const diagnostics = [];

      callback(null, {
        provider,
        resourceSchemas,
        dataSourceSchemas,
        diagnostics,
      });
    };

    const prepareProviderConfig = (call, callback) => {
      try {
        console.log('prepareProviderConfig callback');
        console.log(call.request);
        console.log('pack:', msgpack.unpack(call.request.config.msgpack));
  
        callback(null, {
          preparedConfig: {
            msgpack: call.request.config.msgpack,
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
      const { request: { typeName, version, rawState } } = call;
      console.log('upgradeResourceState callback!', typeName, version, rawState);
      const value = JSON.parse(rawState.json.toString('utf-8'))
      console.log('value', value);
      callback(null, {
        upgradedState: {
          msgpack: Buffer.from(msgpack.pack(value))
        },
      });
    };

    const configure = (call, callback) => {
      console.log('configure callback!');
      callback(null, {});
    };

    const readResource = (call, callback) => {
      console.log('readResource callback!');
      const { request: { typeName, currentState } } = call;
      console.log(call);
      console.log('reading resource for', typeName, getValueFromDynamicValue(currentState));
      callback(null, {
        newState: currentState,
      });
    };
    
    const planResourceChange = (call, callback) => {
      console.log('planResourceChange callback!');
      const { request: { typeName, priorState, proposedNewState, config } } = call;
      console.log('priorState', getValueFromDynamicValue(priorState));
      console.log('proposedNewState', getValueFromDynamicValue(proposedNewState));
      console.log('config', getValueFromDynamicValue(config));
      callback(null, {
        plannedState: proposedNewState,
        requiresReplace: []
      });
    };

    const applyResourceChange = (call, callback) => {
      console.log('applyResourceChange callback!');
      const { request: { typeName, priorState, plannedState, config } } = call;
      console.log('priorState', getValueFromDynamicValue(priorState));
      console.log('plannedState', getValueFromDynamicValue(plannedState));
      console.log('config', getValueFromDynamicValue(config));
      callback(null, {
        newState: plannedState,
      });
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