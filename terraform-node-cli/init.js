// @flow strict
const chalk = require('chalk');
const { exec } = require('child_process');
const { dirname, sep } = require('path');
const { writeFile } = require('fs').promises;
const { install } = require('./install');

const createSkeletons = () => {
  const packageContents = JSON.stringify({
    private: true,
    version: '0.1.0',
    dependencies: {
      '@lukekaalim/terraform-plugin-sdk': '^3.1.2'
    },
  }, null, 2);
  const manifestContents = JSON.stringify({
    type,
    namespace,
    version: '0.1.0',
    entry: 'index.js',
  }, null, 2);
  const entryContents = `
  `;
}

const createNodePackage = async () => {
  const dirs = process.cwd().split(sep);
  const namespace = dirs[dirs.length - 2];
  const type = dirs[dirs.length - 1];

  await writeFile('./terraform-provider.json', JSON.stringify({
    type,
    namespace,
    version: '0.1.0',
    entry: 'index.js',
  }, null, 2));
  await writeFile('./package.json', JSON.stringify({
    name: `@${namespace}/${type}-provider`,
    private: true,
    main: 'index.js',
    version: '0.1.0',
    dependencies: {
      '@lukekaalim/terraform-plugin-sdk': '^3.1.2'
    },
  }, null, 2));
  await writeFile('./index.js', [
`const { createPlugin, createProvider, createResource } = require('@lukekaalim/terraform-plugin-sdk');`,
``,
`const provider = createProvider({ name: '${type}' })`,
`const resource = createResource({ name: 'my_resource', version: 1 })`,
``,
`const plugin = createPlugin(provider, [resource]);`,
``,
`plugin.run()`
  ].join('\n'));
  await writeFile('./main.tf', [
`terraform {
  required_providers {
    ${type} = {
      source = "local/${namespace}/${type}"
      version = "0.1.0"
    }
  }
}`,
``,
`resource "${type}_my_resource" "my_example_resource" {

}`
  ].join('\n'));
  await new Promise((res) => exec('npm install', {}, (err, stdout, stderr) => (console.log(stdout, stderr), res())));
  await install();
  await new Promise((res) => exec('terraform init', {}, (err, stdout, stderr) => (console.log(stdout, stderr), res())));

  console.log(chalk.blue(`Initialized node-terraform project ${namespace}/${type}`));
};

const init = async () => {
  await createNodePackage();
};

module.exports = {
  init,
};
