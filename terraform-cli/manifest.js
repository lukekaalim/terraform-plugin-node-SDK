// @flow strict
const chalk = require('chalk');
const { toObject, toString } = require('@lukekaalim/cast');
const { mkdir, chmod, symlink, rmdir, readFile, unlink, writeFile } = require('fs').promises;
const { resolve, join } = require('path');

/*::
export type PluginManifest = {
  type: string,
  namespace: string,
  version: string,
  entry: string,
};
*/
const toPluginManifest = (value/*: mixed*/)/*: PluginManifest*/ => {
  const object = toObject(value);
  return {
    type: toString(object.type),
    namespace: toString(object.namespace),
    version: toString(object.version),
    entry: toString(object.entry),
  }
};

const getManifestPath = (directory/*: string*/ = '.')/*: string*/ => {
  return resolve(directory, 'terraform-plugin.config.json');
};

const readManifest = async (directory/*: string*/ = '.')/*: Promise<PluginManifest>*/ => {
  const file = await readFile(getManifestPath(directory), 'utf8');
  const value = JSON.parse(file);
  const manifest = toPluginManifest(value);
  return manifest;
};


const handleManifestCommand = async () => {
  const manifest = await readManifest();
  console.log(chalk.green(JSON.stringify(manifest, null, 2)));
};

module.exports = {
  toPluginManifest,
  getManifestPath,
  readManifest,
  handleManifestCommand,
};