
const { createPlugin } = require('@lukekaalim/terraform-plugin');

const exampleResource = {
  name: 'resource',
  attributes: [],
};
const exampleProvider = {
  name: 'empty',
  attributes: [],
  resources: [exampleResource]
};

const examplePlugin = createPlugin(exampleProvider);

examplePlugin.start();
