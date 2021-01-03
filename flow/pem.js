// @flow strict

/*::
declare module "pem" {
  declare class ClientSigningRequest{}

  declare function createCSR({
    altNames: string[]
  }): Promise<{ csr: ClientSigningRequest, clientKey: string }>;
  
  declare function createCertificate({
    csr: ClientSigningRequest,
    clientKey: string,
    certificate: string
  }): Promise<{ certificate: string, serviceKey: string }>;

  declare module.exports: {
    promisified: {
      createCSR: typeof createCSR,
      createCertificate: typeof createCertificate,
    }
  };
}
*/