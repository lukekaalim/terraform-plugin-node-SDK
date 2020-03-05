const { spawn } = require('child_process');
const pem = require('pem').promisified;
const { createEncodedCert, mark } = require('go-plugin-helper-node');

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

const hashicorpCert = `MIICMTCCAZKgAwIBAgIRAMQG1pVDYIoDodqjMypzV/owCgYIKoZIzj0EAwQwKDESMBAGA1UEChMJSGFzaGlDb3JwMRIwEAYDVQQDEwlsb2NhbGhvc3QwIBcNMjAwMzA1MDAyNzUzWhgPMjA1MDAzMDUxMjI4MjNaMCgxEjAQBgNVBAoTCUhhc2hpQ29ycDESMBAGA1UEAxMJbG9jYWxob3N0MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAD0GNjHnKejuWBXrapvOQ1k7oB1AzHasMospcFS0ZMsX4dm+uh56Y0jBjwuAoLjX8WRpCImdN+EyYhOKi9s2WIN8AEUIJXRRCBvoOD4Ji4yRkchlR4wdCzsbLWsJe449mR+NSc8s06ammxIJIa5GTYuaeEdpTrxkYZzplR3odAgZ8CQajWDBWMA4GA1UdDwEB/wQEAwICrDAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwDwYDVR0TAQH/BAUwAwEB/zAUBgNVHREEDTALgglsb2NhbGhvc3QwCgYIKoZIzj0EAwQDgYwAMIGIAkIAyg1lPREkND0aHscgAlbJwNH6cxd34eC2ZO1eIyfF2NMoc689ZhoNBupLwpRfnhJ309Wid4pACISf3R4mhxvJRIQCQgCvyES5b8x//1ohznJ8lr44kP0hbq8mxod8kSnspSiiLa8N3FFvf3/FyOszuyfDWawqhGWy79Df2PN0Skfid7AKaw`;

const base64RemovePadding = (str) => {
  return str.replace(/={1,2}$/, '');
}

const createGoPluginClient = async (handshake, plugin) => {
  const { certificate } = await pem.createCertificate({
    selfSigned: true,
    altNames: ['localhost']
  });

  const env = {
    ...process.env,
    // add the magic cookie!
    [handshake.MagicCookieKey]: handshake.MagicCookieValue,
    ['PLUGIN_CLIENT_CERT']: createEncodedCert(),
  };
  // Ignore STDIN, create a readableStream for STDOUT, and write all STDERR to this process as well.
  const stdio = ['ignore', 'pipe', 'inherit'];
  const shell = '/bin/bash';

  const pluginProcess = spawn(plugin, [], { env, stdio, shell });

  pluginProcess.stdout.setEncoding('utf8');

  const marker = await getConnectionMarker(pluginProcess);
  console.log(env.PLUGIN_CLIENT_CERT);
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
