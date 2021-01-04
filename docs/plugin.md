---
layout: default
title: Plugin
parent: Guides
---
## Creating a Plugin

> Warning: this code is legacy, and no longer accurate

### Introduction
In this guide, we walk through the creation of a terraform plugin that can interact with a fictional api that can create cats.

### Plugin declaration

To build a plugin, you only need a provider. But to do something useful, you also probably want at least one resource.

In this example, we'll build a plugin that manages ans CRUD API that manages cats called the Cat API (with a handy client library at `@example/cat-api`). We use this fictional api by instantiation a CatClient from it's npm package with a token and id, and the use it's promise-based methods to create, read, update, or destroy (oh no!) cats.

We'll split this plugin into three files, one with the provider declaration, one with a cat resource declaration, and finally one with the plugin that combines them all.

### Provider

Our fictional package requires an ID and a token, so we define them as part of the "schema".

```js
// provider.js
const {
  createSchema,
  createAttribute,
  createProvider,
  types,
} = require('@lukekaalim/terraform-plugin-sdk');
const { CatClient } = require('@example/cat-api');

// We can't interact with the cat api without a token or
// id, so we include them in the schema
const schema = createSchema({
  'token': { type: types.string },
  'id': { type: types.string },
});

const catProvider = createProvider({
  name: 'cat-api',
  block: schema,
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
provider "cat-api" {
  token = "my-super-secret-token"
  id = "my-personal-id"
}
```

### Resources

```js
// resources.js
const {
  createSchema,
  createResource,
  DiagnosticError,
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

// our fictional kitty resource has a similar structure
// to our schema
// type Kitty = {
//    name: string,
//    color: string,
//    cuteness: number,
//    friendliness: number,
//    id: number,
// }

const kittyResource = createResource({
  name: 'kitty',
  block: kittySchema,
  plan({ catClient }, state, config, plan) {
    return {
      // here we can implement the defaults
      color: 'brown',
      ...plan,
    };
  },
  async read({ catClient }, config) {
    return await catClient.getKitty(config.id);
  },
  async create({ catClient }, config) {
    return await catClient.createKitty({
      name: config.name,
      color: config.color,
      cuteness: config.cuteness,
      friendliness: config.friendliness,
    });
  },
  async update({ catClient }, state, config) {
    return await catClient.updateKitty(
      state.id,
      {
        name: config.name,
        color: config.color || 'brown',
        cuteness: config.cuteness,
        friendliness: config.friendliness,
      }
    );
  },
  async destroy(provider, state) {
    // Though normally you'd want a tear down step,
    // our cat api doesnt allow it, so you can throw a
    // DiagnosticError which will be send to terraform.
    throw new DiagnosticError(
      'Nobody destroys kitty!',
      '.',
      'ERROR',
      'You cannot destroy a kitty. It\'s just not done.'
    );
  }
});

module.exports = {
  kittyResource,
}
```
Your kitty resource will look like:
```hcl
resource "cat-api_kitty" "myKitty" {
  name = 'mr spekles'
  color = 'white with light brown splotches'
  friendliness = 100
  cuteness = 10000
}
```

### Plugin

And finally, we can defined a plugin that ties the provider and resource together, providing the methods to start our plugin instance.
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

And with that, our Cat-API plugin is done!

### Next Steps
Having finished our plugin, you might be interested in [distributing and deploying](./deploy.md) your plugin to users, or [testing your plugin](./test.md).