// @flow strict
const chalk = require('chalk');
const { exec } = require('child_process');
const { dirname, sep } = require('path');
const { writeFile } = require('fs').promises;
const { install } = require('./install');

const createSkeleton = async (providerName) => {
  const packageContents = JSON.stringify({
    private: true,
    dependencies: {
      '@lukekaalim/terraform-plugin': '^1.0.1'
    },
  }, null, 2);
  const manifestContents = JSON.stringify({
    type: providerName,
    namespace: 'example',
    version: '0.1.0',
    entry: 'plugin.js',
  }, null, 2);
  const pluginContents = `
const { createPlugin } = require('@lukekaalim/terraform-plugin');

const exampleResource = {
  name: 'resource',
  attributes: [],
};
const exampleProvider = {
  name: '${providerName}',
  attributes: [],
  resources: [exampleResource]
};

const examplePlugin = createPlugin(exampleProvider);

examplePlugin.start();
`;
  const mainConfiguration = `
terraform {
  required_providers {
    ${providerName} = {
      source = "local/example/${providerName}"
      version = "0.1.0"
    }
  }
}

resource "${providerName}_resource" "my_example_resource" {}
  `;

  await Promise.all([
    writeFile('package.json', packageContents),
    writeFile('terraform-plugin.config.json', manifestContents),
    writeFile('main.tf', mainConfiguration),
    writeFile('plugin.js', pluginContents),
  ])
}

const createNodePackage = async () => {
  const dirs = process.cwd().split(sep);
  const type = dirs[dirs.length - 1];

  await createSkeleton(type);

  await new Promise((res) => exec('npm install', {}, (err, stdout, stderr) => (console.log(stdout, stderr), res())));
  await install();
  await new Promise((res) => exec('terraform init', {}, (err, stdout, stderr) => (console.log(stdout, stderr), res())));

  console.log(chalk.blue(`Initialized node-terraform project example/${type}`));
};

const init = async () => {
  await createNodePackage();
};

module.exports = {
  init,
};
