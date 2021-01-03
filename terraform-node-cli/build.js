// @flow strict
/*:: import type { PluginManifest } from './manifest'; */
const { dir } = require('tmp-promise');
const { createWriteStream } = require('fs');
const { sign, cleartext: { fromText } } = require('openpgp');
const chalk = require('chalk');
const { spawn } = require('child_process');
const { readFile, writeFile } = require('fs').promises;
const archiver = require('archiver');
const { exec } = require('pkg')
const { homedir } = require('os');
const { join, basename } = require('path');
const { createHash } = require('crypto');
const { readManifest } = require('./manifest');

const getPkgOS = (target/*: Target*/)/*: string*/ => {
  switch (target.os) {
    case 'linux':
      return 'linux';
    case 'macos':
      return 'macos';
    case 'windows':
      return 'win';
    default:
      throw new Error();
  }
};

const getPkgTarget = (target/*: Target*/)/*: string*/ => {
  return ['latest', getPkgOS(target), target.arch].join('-');
}

const getGoOS = (target/*: Target*/) => {
  switch (target.os) {
    case 'linux':
      return 'linux';
    case 'macos':
      return 'darwin';
    case 'windows':
      return 'windows';
    default:
      throw new Error();
  }
};
const getGoArch = (target/*: Target*/) => {
  switch (target.arch) {
    case 'x32':
      return '386';
    case 'x64':
      return 'amd64';
    default:
      throw new Error();
  }
}

const getGoTarget = (target/*: Target*/)/*: string*/ => {
  return [getGoOS(target), getGoArch(target)].join('_')
};

const binary = async (
  manifestDirectory/*: string*/,
  { entry, type, version }/*: PluginManifest*/,
  target/*: Target*/,
  outputDirectory/*: string*/,
) => {
  const entryPath = join(manifestDirectory, entry);
  const output = join(outputDirectory, `terraform-provider-${type}_v${version}`);
  const pkgCommands = [
    entryPath,
    '--target', getPkgTarget(target),
    '--output', output,
  ];
  console.log(chalk.blue(JSON.stringify(pkgCommands, null, 2)));
  await exec(pkgCommands);
  return output;
};

/*::
export type Target = {
  os: 'linux' | 'macos' | 'windows',
  arch: 'x64' | 'x32'
};
*/

const signature = async (shasumPath) => {
  const process = spawn('gpg', ['--detach-sig', shasumPath], { stdio: 'inherit' });
  await new Promise(r => process.on('close', r));
};

const shasum = async ({ type, version } /*: PluginManifest*/, archivePaths/*: string[] */) => {
  const archiveShasumLine = await Promise.all(archivePaths.map(async archivePath => {
    const archiveContents = await readFile(archivePath);
    const archiveHash = createHash('sha256');
    archiveHash.update(archiveContents, 'utf8');
    const hashResult = archiveHash.digest('hex');
    const name = basename(archivePath);
    return [hashResult, name].join('  ');
  }));
  const shasumPath = `terraform-provider-${type}_v${version}_SHA256SUMS`;
  const shasumContents = archiveShasumLine.join('\n');
  console.log(chalk.blue(shasumContents));
  await writeFile(shasumPath, shasumContents, 'utf8');
  return shasumPath;
};

const archive = async ({ type, version }/*: PluginManifest*/, target/*: Target*/, binaryPath/*: string*/)/*: Promise<string>*/ => {
  const goTarget = getGoTarget(target);
  const archivePath = `terraform-provider-${type}_${version}_${goTarget}.zip`;
  const archiveFile = createWriteStream(archivePath);
  const archiveContents = archiver('zip');
  console.log(chalk.blue(JSON.stringify(archivePath, null, 2)));
  const binaryContent = await readFile(binaryPath);
  archiveContents.append(binaryContent, { name: `terraform-provider-${type}_v${version}` });
  archiveContents.pipe(archiveFile);
  await archiveContents.finalize();
  return archivePath;
};

const defaultTargets = [
  {
    os: 'macos',
    arch: 'x64'
  },
  {
    os: 'linux',
    arch: 'x64'
  }
];

const pMap = async /*:: <A, B>*/(array/*: A[]*/, func/*: A => Promise<B>*/)/*: Promise<B[]>*/ => {
  return await Promise.all(array.map(func));
};

const build = async (targets/*: Target[]*/ = defaultTargets) => {
  const manifestDirectory = '.';
  const manifest = await readManifest(manifestDirectory);
  console.log(chalk.blue(JSON.stringify(manifest, null, 2)));
  const archivePaths = [];
  for (const target of targets) {
    const { cleanup, path: buildTempDir } = await dir({ unsafeCleanup: true });
    try {
      const binaryPath = await binary(manifestDirectory, manifest, target, buildTempDir);
      archivePaths.push(await archive(manifest, target, binaryPath));
    } finally {
      cleanup();
    }
  }
  const shasumPath = await shasum(manifest, archivePaths);
  await signature(shasumPath);
};

module.exports = {
  build,
};
