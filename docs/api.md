# API

`@lukekaalim/terraform-plugin-sdk` exports the following methods and objects:

## `createPlugin`
```js
const sdk = require('@lukekaalim/terraform-plugin-sdk');
const plugin = sdk.createPlugin(
  provider, // Provider
  resources, // Array<Resource>
);
```
Returns a Plugin from a provider and an array of resources.

### Plugin
```js
plugin.run();
```
A plugin is an object with a `run` property that activates the plugin when called. An activated plugin initiates a handshake over the node processes stdout before starting a GRPC server. Calling this function should be the last step in your plugin program.

## `createProvider`
```js
const sdk = require('@lukekaalim/terraform-plugin-sdk');
const provider = sdk.createProvider({
  name, // string
  version, // ? number
  schema, // ? Schema
  prepare, // ? (Config) => Promise<Config>
  configure, // ? (Config) => Promise<ConfiguredProvider>
});
```

## `createSchema`
```js
const sdk = require('@lukekaalim/terraform-plugin-sdk');
const provider = sdk.createSchema({
  [attributeName]: { // [string]: Attribute
    type, // SchemaType
    optional,// ? bool
    required, // ? bool
    computed, // ? bool
    sensitive, // ? bool
  }
});
```

## `createResource`
```js
const sdk = require('@lukekaalim/terraform-plugin-sdk');
const provider = sdk.createResource({
  version, // number
  block, // ? Schema
  validate, // ? (ConfiguredProvider, Config) => null
  read, // ? (ConfiguredProvider, State) => State
  plan, // ? (ConfiguredProvider, State, Config, Plan) => State
  create, // ? (ConfiguredProvider, Config) => State
  update, // ? (ConfiguredProvider, State, Config) => State 
  delete, // ? (ConfiguredProvider, State) => State
});
```
## `types`
```js
const sdk = require('@lukekaalim/terraform-plugin-sdk');
sdk.types.string; // SchemaType
sdk.types.number; // SchemaType
sdk.types.bool; // SchemaType
sdk.types.list; // (SchemaType) => SchemaType
sdk.types.object; // ({ [string]: SchemaType }) => SchemaType
```