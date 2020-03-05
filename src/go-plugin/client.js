const { spawn } = require('child_process');
const pem = require('pem').promisified;

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

const createGoPluginClient = async (handshake, plugin) => {
  const { certificate } = await pem.createCertificate({
    selfSigned: true,
    altNames: ['localhost']
  });

  const env = {
    ...process.env,
    // add the magic cookie!
    [handshake.MagicCookieKey]: handshake.MagicCookieValue,
    ['PLUGIN_CLIENT_CERT']: Buffer.from(certificate).toString('base64').slice(0, -2),
  };
  // Ignore STDIN, create a readableStream for STDOUT, and write all STDERR to this process as well.
  const stdio = ['ignore', 'pipe', 'inherit'];
  const shell = '/bin/bash';

  const pluginProcess = spawn(plugin, [], { env, stdio, shell });

  pluginProcess.stdout.setEncoding('utf8');
  
  const marker = await getConnectionMarker(pluginProcess);
  console.log(marker);

  const exitCode = await new Promise(res => {
    pluginProcess.on('close', (exitCode) => {
      res(exitCode);
    });
  });
  return exitCode;
};

module.exports = {
  createGoPluginClient,
};
