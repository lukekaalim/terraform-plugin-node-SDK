// @flow strict
const package = require('./package.json');
const chalk = require('chalk');

const version = () => {
  console.log(chalk.blue([
    package.name,
    chalk.bold(package.version),
  ].join('@')));
};

module.exports = {
  version,
};