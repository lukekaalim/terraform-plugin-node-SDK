// @flow strict
/*:: import type { Service } from './services'; */
/*:: import type { ConsoleLike } from 'console'; */
const { unlink } = require('fs').promises;
const { Console } = require('console');
const { PassThrough } = require('stream');
const { Server } = require('@grpc/grpc-js');

const { createCredentials } = require('./credentials');
const { handshakeToString, isValidMagicCookie } = require('./handshake');

const {
  createHealthcheckService,
  createStdioService,
  createControllerService,
  addServiceToServer,
} = require('./services');

/*::
export type GOPluginOptions = {
  pluginVersion: string,
  magicCookieKey: string,
  magicCookieValue: string,
};

export type GoPluginServer = {
  server: Server,
  console: ConsoleLike,
  start: () => Promise<void>,
  close: () => Promise<void>,
};
*/

class MagicCookieError extends Error {}

const createGOPluginServer = async ({ pluginVersion, magicCookieKey, magicCookieValue }/*: GOPluginOptions*/)/*: Promise<GoPluginServer>*/ => {
  if (!isValidMagicCookie(magicCookieKey, magicCookieValue))
    throw new MagicCookieError(`Magic cookie does not match!`);

  const path = `/tmp/terraform-${Math.floor(Math.random() * 100000)}.sock`;
  const transmissionType = 'unix';
  const address = `${transmissionType}://${path}`;

  const server = new Server();
  const logStream = new PassThrough();
  const errorStream = new PassThrough();
  const console = new Console(logStream, errorStream);

  const { creds, cert } = await createCredentials();
  const handshake = {
    protocolVersion: 1,
    pluginVersion,
    path,
    clientProtocol: 'grpc',
    transmissionType,
    certificate: cert
  };

  const close = async () => {
    server.forceShutdown();
    //await unlink(path);
  };
  const start = async () => new Promise(res =>
    server.bindAsync(address, creds, () => {
      server.start();
      process.stdout.write(handshakeToString(handshake), 'utf8');
      res();
    })
  );
  const goPlugin = {
    server,
    console,
    start,
    close,
  }

  addServiceToServer(await createHealthcheckService(console), server);
  addServiceToServer(await createStdioService(console, logStream, errorStream), server);
  addServiceToServer(await createControllerService(console, goPlugin), server);

  return goPlugin;
};

module.exports = {
  createGOPluginServer,
  MagicCookieError,
};
