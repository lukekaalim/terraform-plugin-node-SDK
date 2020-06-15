## Cat Guide

### Introduction
In this guide, we walk through the creation of a terraform provider that can interact with a fictional api that can create cats.

### Plugin declaration

To build a plugin, you need at least a provider. But to do something useful, you also probably want at least one resource.

In this example, we'll build a plugin that manages an Example CRUD API that manages cats called the Cat API (`@example/cat-api`). We use this fictional api by instantiation a CatClient from it's npm package with a token and id, and the use it's promise-based methods to create, update, or destroy (oh no!) cats.

We'll split this plugin into three files, one with the provider declaration, one with a cat resource declaration, and finally one with the plugin that combines them all.

### Provider

Our fictional package requires an ID and a token, so we define them as part of the "schema".

```js
// provider.js
const {
  createSchema,
  createAttribute,
  createProvider
} = require('@lukekaalim/terraform-plugin-sdk');
const { CatClient } = require('@example/cat-api');

// We can't interact with the cat api without a token or
// id, so we include them in the schema
const catProviderSchema = createSchema({
  'token': createAttribute('string'),
  'id': createAttribute('string'),
});

const catProvider = createProvider({
  name: 'cat_api',
  schema: catProviderSchema,
  configure(config) {
    const { token, id } = config;
    const catClient = new CatClient(
      token,
      id,
    );
    // the results of the configure function are passed to
    // all resources, so we return the cat client object.
    // we pass it as a property of an object
    // just in case we need
    // to refactor later and provide more clients
    return { catClient };
  }
});

module.exports = {
  catProvider,
};
```

When you create this provider in terraform, it will look like this:

```hcl
provider "cat_api" {
  token = "my-super-secret-token"
  id = "my-personal-id"
}
```

### Resources

```js
// resources.js
const {
  createSchema,
  createAttribute,
  createResource,
} = require('@lukekaalim/terraform-plugin-sdk');

const kittySchema = createSchema({
  'name': createAttribute('string'),
  // if the user does not provide a color, we
  // default to brown
  'color': createAttribute('string', { optional: true }),
  'cuteness': createAttribute('number'),
  'friendliness': createAttribute('number'),
  // kitty's get assigned a unique ID on creation, so
  // we mark this property as 'computed', which indicates
  // it will be defined at runtime instead of as part
  // of the configuration
  'id': createAttribute('number', { computed: true })
});

const kittyToSchema = kitty => ({
  name: kitty.name,
  color: kitty.color,
  cuteness: kitty.cuteness,
  friendliness: kitty.friendliness,
  id: kitty.id,
});

const kittyResource = createResource({
  name: 'kitty',
  schema: kittySchema,
  async read(provider, config) {
    const { catClient } = provider;
    const kitty = await catClient.getKitty(config.id);
    return kittyToSchema(kitty);
  },
  async create(provider, config) {
    const { catClient } = provider;
    const kitty = await catClient.createKitty({
      name: config.name,
      color: config.color || 'brown',
      cuteness: config.cuteness,
      friendliness: config.friendliness,
    });
    return kittyToSchema(kitty);
  },
  async update(provider, state, config) {
    const { catClient } = provider;
    const kitty = await catClient.updateKitty(
      state.id,
      {
        name: config.name,
        color: config.color || 'brown',
        cuteness: config.cuteness,
        friendliness: config.friendliness,
      }
    );
    return kittyToSchema(kitty);
  },
  async destroy(provider, state) {
    throw new Error('Nobody destroys kitty!');
    // You probably got the picture
  }
});

module.exports = {
  kittyResource,
}
```
```js
// plugin.js
const { createPlugin } = require('@lukekaalim/terraform-plugin-sdk');

const { kittyResource } = require('./resources');
const { catProvider } = require('./provider');

const catPlugin = createPlugin(catProvider, [kittyResource]);

module.exports = {
  catPlugin,
};
```