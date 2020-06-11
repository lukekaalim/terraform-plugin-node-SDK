module.exports = {
  ...require('./terraform-helper/plugin'),
  ...require('./terraform-helper/provider'),
  ...require('./terraform-helper/resource'),
  ...require('./terraform-helper/schema'),
};
