// @flow strict

/*::
declare module "@grpc/grpc-js" {
  import type { Console } from 'console';
  declare type GRPCWriteFlags = number;

  declare type Writable = {
    write: (value: mixed) => void; 
    end: () => void;
  };
  declare type Readable = {
    on: ((data: mixed) => mixed) => void,
    off: ((data: mixed) => mixed) => void,
  };

  declare class GRPCMetadata {
    get: (key: string) => string | Buffer,
  }

  declare class PackageDefinition {}
  declare type GRPCServiceDefinition = {
    [string]: any,
  };

  declare type GRPCServerCall = {
    request: any,
    cancelled: boolean,
    metadata: GRPCMetadata,
  };


  declare type UnaryCallback = (
    error: ?Error,
    value: ?any,
    trailer?: GRPCMetadata,
    flags?: GRPCWriteFlags
  ) => void;

  declare type GRPCUnaryHandler = (call: GRPCServerCall, callback: UnaryCallback) => mixed;
  declare type GRPCClientStreamHandler = (call: GRPCServerCall & Readable, callback: UnaryCallback) => mixed;
  declare type GRPCServerStreamHandler = (call: GRPCServerCall & Writable) => mixed;
  declare type GRPCDuplexStreamHandler = (call: GRPCServerCall & Writable & Readable) => mixed;

  declare type GRPCServerHandler =
    | GRPCUnaryHandler
    | GRPCClientStreamHandler
    | GRPCServerStreamHandler
    | GRPCDuplexStreamHandler

  declare type GRPCServiceImplementationMap = {
    [string]: GRPCServerHandler,
  };

  declare type KeyCertPair = {
    private_key: Buffer,
    cert_chain: Buffer,
  }
  
  declare class ServerCredentials {
    static createSsl(rootCertificate: Buffer, keyCertPairs?: KeyCertPair[]): ServerCredentials;
    static createInsecure(): ServerCredentials;
  }

  declare class Server {
    start(): void;
    bind(port: string, credentials: ServerCredentials): void;
    bindAsync(address: string, credentials: ServerCredentials, (error: ?Error, port: ?number) => void): void;
    addService(definition: GRPCServiceDefinition, implementation: GRPCServiceImplementationMap): void;
    tryShutdown(() => mixed): void;
    forceShutdown(): void;
  }

  declare module.exports: {
    ServerCredentials: typeof ServerCredentials,
    Server: typeof Server,
    setLogger: (logger: Console) => void;
    loadPackageDefinition: (packageDef: PackageDefinition) => GRPCServiceDefinition
  };
}

declare module "@grpc/proto-loader" {
  import type { PackageDefinition } from '@grpc/grpc-js';
  declare module.exports: {
    load: (path: string) => Promise<PackageDefinition>
  }
}
*/