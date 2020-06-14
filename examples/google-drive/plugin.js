const { createPlugin } = require('@lukekaalim/terraform-plugin-sdk');
const { googleDriveProvider } = require('./provider');
const { fileResource } = require('./resources');

const googleDrivePlugin = createPlugin(googleDriveProvider, [fileResource]);

module.exports = {
  googleDrivePlugin
};