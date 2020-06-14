const { Unknown } = require('../terraform-plugin/dynamicValue');

const createUnknownValue = () => {
  return new Unknown();
};

module.exports = {
  createUnknownValue,
};