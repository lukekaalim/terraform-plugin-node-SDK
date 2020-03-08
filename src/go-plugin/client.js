const { spawn } = require('child_process');
const pem = require('pem').promisified;
const grpc = require('@grpc/grpc-js');
const net = require('net');

const getConnectionMarker = (pluginProcess) => new Promise(resolve => {
  let firstLine = '';
  const stdoutListener = (data) => {
    const newlineIndex = data.indexOf('\n');
    if (newlineIndex !== -1) {
      firstLine += data.slice(0, newlineIndex);
      
      const [
        pluginVersion,
        terraformVersion,
        connectionType,
        connectionAddress,
        connectionProtocol,
        mTLSCert
      ] = firstLine.split('|');

      resolve({
        pluginVersion,
        terraformVersion,
        connectionType,
        connectionAddress,
        connectionProtocol,
        mTLSCert
      });

      pluginProcess.stdout.removeListener('data', stdoutListener);
    } else {
      firstLine += data;
    }
  };
  pluginProcess.stdout.addListener('data', stdoutListener);
});

const base64RemovePadding = (str) => {
  return str.replace(/={1,2}$/, '');
}

const base64AddPadding = (str) => {
  return Buffer.from(str, 'base64').toString('base64');
};

const createGoPluginClient = async (pluginClient, handshake, plugin) => {
  const { certificate: rootCert } = await pem.createCertificate({
    selfSigned: true,
  });

  const env = {
    ...process.env,
    // add the magic cookie!
    [handshake.MagicCookieKey]: handshake.MagicCookieValue,
    ['PLUGIN_PROTOCOL_VERSIONS']: handshake.ProtocolVersion,
    //['PLUGIN_CLIENT_CERT']: rootCert,
  };
  // Ignore STDIN, create a readableStream for STDOUT, and write all STDERR to this process as well.
  const stdio = ['ignore', 'pipe', 'inherit'];
  const shell = '/bin/bash';

  const pluginProcess = spawn(plugin, [], { env, stdio, shell });

  pluginProcess.stdout.setEncoding('utf8');

  const { connectionProtocol, connectionAddress, mTLSCert: rawServerCert = '' } = await getConnectionMarker(pluginProcess);

  const { csr, clientKey } = await pem.createCSR();
  const { certificate: clientCert, serviceKey } = await pem.createCertificate({
    certificate: rootCert,
    csr,
    clientKey,
  });

  /*const serverCert =
`-----BEGIN CERTIFICATE-----
${base64AddPadding(rawServerCert).match(/.{1,64}/g).join('\n')}
-----END CERTIFICATE-----`;*/

  const connectionURL = 'unix://' + connectionAddress;

  console.log(connectionProtocol);
  const channelCreds = grpc.credentials.createSsl(
    Buffer.from(rootCert),
    //Buffer.from(serviceKey),
    //Buffer.from(clientCert),
  );
  const testCreds = grpc.credentials.createInsecure();
  testCreds._getConnectionOptions = () => {
    return {
      createConnection: (address, options) => {
        return net.createConnection("/" + address.hostname + address.pathname);
      },
    };
  };

  const client = new pluginClient(connectionURL, testCreds);

  client.GetSchema({}, (a, b) => {
    for (const attribute of b.provider.block.attributes) {
      console.log(attribute.name, Buffer.from(attribute.type, 'base64').toString('utf8'));
    }
  });
};

module.exports = {
  createGoPluginClient,
};
