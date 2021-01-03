#!/usr/bin/env node
// @flow strict
const chalk = require('chalk');
const { version } = require('./version');
const { install, uninstall } = require('./install');
const { build } = require('./build');
const { init } = require('./init');
 
const main = async (command, ...arguments) => {
  try {
    switch (command) {
      case undefined:
      case '':
      case 'version':
        return await version();
      case 'init':
        return await init();
      case 'install':
        return await install();
      case 'uninstall':
        return await uninstall();
      case 'build':
        return await build();
    }
  } catch (error) {
    console.error(chalk.red(error));
  }
};

main(...process.argv.slice(2));