// @flow strict
const { createCSR, createCertificate } = require('pem').promisified;
const { ServerCredentials } = require('@grpc/grpc-js');

/*::
export type GOPluginCredentials = {
  creds: ServerCredentials,
  cert: ?string
};
*/

const createCredentials = async ()/*: Promise<GOPluginCredentials>*/ => {
  const rootCertificate = process.env['PLUGIN_CLIENT_CERT'];
  if (rootCertificate) {
    return await createSecureCredentials(rootCertificate)
  } else {
    return await createUnsecuredCredentials();
  }
};
const createUnsecuredCredentials = async ()/*: Promise<GOPluginCredentials>*/ => {
  const creds = ServerCredentials.createInsecure();
  const cert = null;
  return { creds, cert };
}

const createSecureCredentials = async (rootCertificate/*: string*/)/*: Promise<GOPluginCredentials>*/ => {
  const { csr: signingRequest, clientKey } = await createCSR({ altNames: ['localhost'] });
  const certificateOptions = {
    certificate: rootCertificate,
    csr: signingRequest,
    clientKey,
  };
  const { certificate: cert, serviceKey } = await createCertificate(certificateOptions);
  const keyCertPair = {
    private_key: Buffer.from(serviceKey),
    cert_chain: Buffer.from(cert),
  };
  const creds = ServerCredentials.createSsl(Buffer.from(rootCertificate), [keyCertPair]);
  return { creds, cert };
};

module.exports = {
  createCredentials,
  createUnsecuredCredentials,
  createSecureCredentials,
};
