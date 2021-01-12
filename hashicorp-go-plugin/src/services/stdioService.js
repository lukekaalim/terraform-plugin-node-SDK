// @flow strict
/*:: import type { GRPCServiceImplementationMap, GRPCServiceDefinition } from '@grpc/grpc-js'; */
/*:: import type { GRPCUnaryHandler, GRPCServerStreamHandler } from '@grpc/grpc-js'; */
/*:: import type { Readable } from 'stream'; */
/*:: import type { ConsoleLike } from 'console'; */
/*:: import type { Service } from '../services'; */

const { load } = require('@grpc/proto-loader');
const { loadPackageDefinition } = require('@grpc/grpc-js');
const path = require('path');


const createStdioService = async (
  console/*: ConsoleLike*/,
  logStream/*: Readable*/,
  errStream/*: Readable*/,
)/*: Promise<Service>*/ => {
  const stdioProto = await load(path.join(__dirname, './stdio.proto'));
  const stdioPackage = loadPackageDefinition(stdioProto);
  const definition = stdioPackage.plugin.GRPCStdio.service;

  const streamStdio/*: GRPCServerStreamHandler*/ = (call) => {
    logStream.on('data', data => {
      call.write({ channel: 1, data: Buffer.from(data) });
    });
    errStream.on('data', data => {
      call.write({ channel: 2, data: Buffer.from(data) });
    });
  };
  
  const implementation = {
    streamStdio,
  };
  console.log('Created STDIO Service');
  return { definition, implementation };
};

module.exports = {
  createStdioService,
};