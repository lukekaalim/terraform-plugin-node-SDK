const { createWriteStream } = require('fs');
const { Console } = require('console');

const setGlobalConsole = (logger) => {
  global.console = logger;
};

const createFileLogger = (filePath, clear = false) => {
  const stream = createWriteStream(filePath, { encoding: 'utf-8', flags: clear ? 'w' : 'a' });

  const logger = new Console({ stdout: stream, stderr: stream, inspectOptions: { depth: null } });

  logger.log(new Date());

  return logger;
};

const createNullLogger = () => {
  return {
    log() {
      return;
    },
    error() {
      return;
    }
  }
};

module.exports = {
  createFileLogger,
  createNullLogger,
  setGlobalConsole,
};