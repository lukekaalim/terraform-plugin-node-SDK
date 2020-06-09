# `@lukekaalim/terraform-plugin-sdk`
This project is an npm package that provides tools for building Terraform Plugins.

Terraform plugins can be used to leverage and extend terraform capabilities, allowing new providers and resource types.

## Example

The following example illustrates a fictional plugin that interfaces with a package called "example-package". In the example, we define a provider and require a secret API Token to be passed to the provider.

```js
// /home/projects/myPlugin/main.js
const {
  createTerraformPlugin,
  createTerraformResource,
} = require('@lukekaalim/terraform-plugin-sdk');
const { createMyClient } = require('example-package');

// The 'schema' defined what the shape of the terraform block will be.
const myProviderSchema = createTerraformSchema({
  'secret_api_token': 'string',
});

// A plugin can export a provider, which is given a change
// to configure itself and create a shared client that will
// be provided to resources
const myProvider = createTerraformProvider(
  'my_provider',
  myProviderSchema,
  async ({ secret_api_token }) => {
    const myClient = await createMyClient(secret_api_token);
    return myClient;
  }
);

const myResourceSchema = createTerraformSchema({
  'cool_factor': 'number',
  'name': 'string',
});

const myResource = createTerraformResource(
  'my_resource',
  myResourceSchema,
  // The myClient argument is the return value of the
  // provider's configuration function
  (myClient) => {
    const read = async ({ name }) => {
      const resource = await myClient.getByName(name);
      return {
        name: resource.name,
        cool_factor: resource.coolFactor,
      };
    };
    const create = async ({ name, coolFactor }) => {
      const resource = new myClient.resource(
        name,
        coolFactor
      );

      await myClient.uploadResource(resource);

      return {
        name: resource.name,
        'cool_factor': resource.coolFactor,
      };
    };
    // you can implement interfaces here that terraform
    // will call to provide updates or creations
    // of resources.
    return {
      read,
      create
    };
  }
);

// A plugin has a name and a version, and can export multiple resources
const plugin = createTerraformPlugin(
  'myPlugin',
  '1.0.1', 
  myProvider,
  [
    myResource
  ]
);

plugin.run();
```

```sh
#!/usr/bin/env sh
# /home/projects/terraform-config/my_provider
# marked with executable permissions

node /home/projects/myPlugin/main.js
```

```terraform
// /home/projects/terraform-config/main.tf
provider "my_provider" {
  secret_api_token = "12345-6789"
}

resource "my_provider_my_resource" "example_resource" { 
  name = "This value will be input to the function"
  cool_factor = 1000
}
```