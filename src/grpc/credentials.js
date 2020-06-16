const { Server, ServerCredentials } = require('@grpc/grpc-js');

const createGRPCServerCredentials = (rootPEMCertificate, serverPEMCertificate, serverPrivateKey) => {
  const keyCertPair = {
    private_key: Buffer.from(serverPrivateKey),
    cert_chain: Buffer.from(serverPEMCertificate),
  };
  const grpcCredentials = ServerCredentials.createSsl(Buffer.from(rootPEMCertificate), [keyCertPair]);

  return grpcCredentials;
};

module.exports = {
  createGRPCServerCredentials,
};