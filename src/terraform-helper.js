const { createFileLogger, setGlobalConsole } = require('./logger');

const logger = createFileLogger('./plugin-sdk.log')
setGlobalConsole(logger);

module.exports = {
  ...require('./terraform-helper/plugin'),
  ...require('./terraform-helper/provider'),
  ...require('./terraform-helper/resource'),
  ...require('./terraform-helper/schema'),
  ...require('./terraform-helper/diagnostic'),
  ...require('./terraform-helper/value'),
};
