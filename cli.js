#!/usr/bin/env node
const { createTerraformPluginClient } = require('./src/terraform-plugin/client');
const { writeFile } = require('fs').promises;

class UnknownCommandError extends Error {
  unknownCommandText;

  constructor(unknownCommandText) {
    super(`No known handler for command ${unknownCommandText}.`);
    this.unknownCommandText = unknownCommandText;
  }
}

class NoMainCommandError extends Error {
  constructor() {
    super('No CLI options were provided to the plugin');
  }
}

class InvalidPluginFilenameError extends Error {
  constructor() {
    super('A bad filename was provided to the CLI');
  }
}

const cli = async (mainCommand, ...otherArgs) => {
  try {
    switch (mainCommand) {
      case 'run':
        const [pluginFilename] = otherArgs;
        if (!pluginFilename) {
          throw new InvalidPluginFilenameError();
        }
        const client = await createTerraformPluginClient(pluginFilename);

        client.GetSchema({}, async (a, b) => {
          await writeFile('./exampleSchema.json', JSON.stringify(b, null, 2), 'utf-8');
        });

        return;
      case undefined:
        throw new NoMainCommandError();
      default:
        throw new UnknownCommandError(mainCommand);
    }
  } catch (err) {
    if (err instanceof UnknownCommandError) {
      console.log(`I didn't understand the command: "${err.unknownCommandText}"`);
    } else if (err instanceof NoMainCommandError) {
      console.log(`Please enter a command.`);
    } else {
      console.error(err);
    }
  }
};

cli(...process.argv.slice(2));