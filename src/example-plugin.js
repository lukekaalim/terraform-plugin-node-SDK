const {
  createProvider,
  createAttribute,
  createSchema,
  createResource,
  createPlugin
} = require('./terraform-helper');

const exampleProvider = createProvider(1, createSchema(1, [
  createAttribute('myAttribute', 'string', 'My Custom Attribute', { required: true })
]));

const exampleResource = createResource('example_my_resource', 1, createSchema(1, [
  createAttribute('myResourceAttribute', 'string', 'My Custom Resource Attribute', { required: true })
]));

const examplePlugin = createPlugin(exampleProvider, [exampleResource]);

examplePlugin.run();