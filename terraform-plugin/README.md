---
title: "@lukekaalim/terraform-plugin"
layout: default
parent: Packages
nav_order: 5
---
# `@lukekaalim/terraform-plugin`

Library for developing node-based terraform plugins. Uses `@lukekaalim/hashicorp-go-plugin` and `@lukekaalim/terraform-service` internally, and exposes some helper methods.

## Installation
```bash
npm install @lukekaalim/terraform-plugin
```

## Quick Example
Heres a quick example of a plugin
```js
// plugin.js
const {
  createPlugin,
  getPlanType,
  Unknown,
 } = require('@lukekaalim/terraform-plugin');

const exampleResource = {
  name: 'resource',
  attributes: [
    { name: 'id', type: 'string', computed: true },
    { name: 'name', type: 'string', required: true },
  ],
  async plan(state, config) {
    return {
      id: state?.id || new Unknown(),
      name: config.name,
    }
  },
  async apply(state, plan) {
    switch (getPlanType(state, plan)) {
      case 'create':
        // create resource here
        return { id: 'new-generated-id', name: plan.name };
      case 'update':
        // update resource here
        return { ...state, name: plan.name };
      case 'destroy':
        // destroy resource here
        return null;
    }
  }
};
const exampleProvider = {
  name: 'example',
  attributes: [],
  resources: [exampleResource]
};

const examplePlugin = createPlugin(exampleProvider);

examplePlugin.start();
```
This plugin creates a provider that can be used in a configuration like:
```hcl
// main.tf

// ...

resource "example_resource" "instance" {
  name = "resource"
}

output "resource_id" {
  value = example_resource.instance.id
}
```

## TODO
 - Data sources
 - API docs
 - Validation
 - Upgrading Resources
 - Typescript libdef