// @flow strict
const os = require('os');
const { resolve } = require('path');
const chalk = require('chalk');
const { join } = require('path');
const { mkdir, chmod, symlink, rmdir, readFile, unlink, writeFile } = require('fs').promises;
const homedir = require('os').homedir();
const { createPluginPackage } = require('./pluginPackage');
const { readManifest } = require('./manifest');

const executableFile = (entry) =>
`#!/usr/bin/env node
require("${resolve(entry)}");
`;

const getOSArch = () => {
  switch (os.arch()) {
    case 'x64':
      return 'amd64';
    case 'x32':
      return '386';
  }
}

const getOSType = () => {
  return os.type().toLowerCase();
};

const getOperatingSystem = () => {
  return [getOSType(), getOSArch()].join('_');
};

const getPluginDirectory = (namespace, type, version) => {
  return join(
    homedir,
    '.terraform.d/plugins/',
    'local',
    namespace,
    type,
    version,
    getOperatingSystem(),
  );
};
const getPluginFilename = (type, version) => {
  return `terraform-provider-${type}_${version}`;
}

const install = async () => {
  const { type, namespace, version, entry } = await readManifest();
  console.log(chalk.blue(JSON.stringify({ type, namespace, version }, null, 2)));
  const pluginDirectory = getPluginDirectory(namespace, type, version);
  const pluginFilename = getPluginFilename(type, version);
  
  console.log(chalk.blue(JSON.stringify({
    pluginDirectory,
    pluginFilename,
  }, null, 2)));

  const pluginPath = join(pluginDirectory, pluginFilename);
  // $FlowFixMe
  await rmdir(pluginDirectory, { recursive: true });
  await mkdir(pluginDirectory, { recursive: true });
  await writeFile(pluginPath, executableFile(entry));
  await chmod(pluginPath, 0o775);

  console.log(chalk.bold(`Installed ${pluginFilename} to ${pluginDirectory}`));
};

const uninstall = async () => {
  const package = JSON.parse(await readFile('./package.json', 'utf8'));
  const [packageName, packageScope = '@plugins'] = package.name.split('/').reverse(); 
  const org = package.author;
  const namespace = packageScope.slice(1);
  const providerName = packageName;
  const version = package.version;
  const binary = package.main;
  const operatingSystem = getOperatingSystem();

  const pluginDirectory = join(homedir, '.terraform.d/plugins/', org, namespace, providerName, version, operatingSystem);
  const pluginFilename = `terraform-provider-${providerName}_${version}`;
  const pluginPath = join(pluginDirectory, pluginFilename);

  await unlink(pluginPath);
  // $FlowFixMe
  await rmdir(pluginDirectory, { recursive: true });

  console.log(chalk.bold(`Uninstalled ${pluginFilename} to ${pluginDirectory}`))
};

module.exports = {
  uninstall,
  install,
};
