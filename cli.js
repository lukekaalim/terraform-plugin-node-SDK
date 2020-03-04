#!/usr/bin/env node
const { createServer } = require('./src/server.js');
const { createGoPluginServer } = require('./src/go-plugin/server.js');

class UnknownCommandError extends Error {
  constructor(unknownCommandText) {
    super(`No known handler for command ${unknownCommandText}.`)
  }
}

class NoMainCommandError extends Error {
  constructor() {
    super('No CLI options were provided to the plugin');
  }
}

const cli = async (mainCommand, ...otherArgs) => {
  try {
    switch (mainCommand) {
      case 'go-plugin': {
        const server = await createGoPluginServer(null, '127.0.0.1:54321', console);
        return;
      }
      case 'server': {
        const server = await createServer();
        console.log('Press any key to shut down.');
        process.stdin.setRawMode( true );
        process.stdin.on('data', function (chunk, key) {
          server.tryShutdown(() => console.log('Server is shut down'));
          process.stdin.pause();
        });
        return;
      }
      case undefined:
        throw new NoMainCommandError();
      default:
        throw new UnknownCommandError(mainCommand);
    }
  } catch (err) {
    console.error(err);
  }
};

cli(...process.argv.slice(2));