const { Console } = require('console');
const { createWriteStream } = require('fs');

const consoleOutStream = createWriteStream('./latest.log', { encoding: 'utf-8', flags: 'a' });
const console = new Console({ stdout: consoleOutStream, stderr: consoleOutStream, inspectOptions: { depth: null } });

console.log(`\nNEW STREAM ${new Date()}\n`)

module.exports = {
  console,
};
