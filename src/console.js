const { Console } = require('console');
const { createWriteStream } = require('fs');

const consoleOutStream = createWriteStream('./latest.log', 'utf-8');
const console = new Console({ stdout: consoleOutStream, stderr: consoleOutStream, inspectOptions: { depth: null } });

module.exports = {
  console,
};
