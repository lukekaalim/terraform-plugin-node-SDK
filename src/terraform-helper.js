const { setGlobalConsole, createNullLogger } = require('./logger');

setGlobalConsole(createNullLogger());

module.exports = {
  ...require('./terraform-helper/plugin'),
  ...require('./terraform-helper/provider'),
  ...require('./terraform-helper/resource'),
  ...require('./terraform-helper/schema'),
  ...require('./terraform-helper/diagnostic'),
  ...require('./terraform-helper/value'),
};
