---
title: "@lukekaalim/terraform-service"
layout: default
parent: Packages
nav_order: 6
---
# `@lukekaalim/terraform-service`

Provides a bare-bones implementation of the Terraform GRPC service. Use with `@lukekaalim/hashicorp-go-plugin` to create a terraform plugin.

## Installation
```bash
npm install @lukekaalim/terraform-service
```
## API
### `createTerraformService()`
```js
const { createTerraformService } = require('@lukekaalim/terraform-service');

const options = {
  getSchema,
};

const service = createTerraformService(
  console,        // Console
  server,         // Server
  options,        // ServiceOptions
);
const {
  definition,     // GRPCServiceDefinition
  implementation, // GRPCServiceImplementation
} = service;
```

```ts
const getSchema = async () => ({
  provider,           // Schema
  resourceSchemas,    // { [string]: Schema }
  dataSourceSchemas,  // { [string]: Schema }
  diagnostics,        // Diagnostic[] 
});
```

### `getDynamicValue()`
### `setPackedDynamicValue()`
### `setJSONDynamicValue()`
### `new Unknown()`

## TODO
  -  Finish API documentation