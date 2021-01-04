---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

## Prerequisites
The SDK comes with a CLI tool that automates some useful processes for development.

1. Install the CLI tools
```bash
npm i @lukekaalim/terraform-cli
```
## Creating the Example Project
The example project is a default skeleton project that comes with everything installed; It's easy to extend the skeleton with your own custom code once it's set up.

1. Create the project folder and set it to the current working directory
```bash
mkdir example
cd example
```

2. Initialize the project
```bash
node-terraform init
```
You should see something like:

```bash
...
added 64 packages from 101 contributors and audited 64 packages in 3.174s
...
Installed terraform-provider-example_0.1.0 to /Users/myname/.terraform.d/plugins/local/example/example/0.1.0/darwin_amd64
...
Terraform has been successfully initialized!
...
Initialized node-terraform project example/example
```

Congratulations! You should now have a functioning terraform plugin!

## Plan and Apply
Lets test it out. By default, the skeleton gave us a provider called "example" and a resource called "example_resource". It also generated a `main.tf` file which contains a configuration to create it. They don't do anything yet, but lets create and destroy one to test that everything works.

1. Apply the example config
```bash
terraform apply --auto-approve
```
You should see something like:

```bash
empty_resource.my_example_resource: Creating...
empty_resource.my_example_resource: Creation complete after 0s

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```
2. Teardown the resources you make:
```bash
terraform destroy --auto-approve
```

## Modify manifest
By default your provider is called "example". You probably want to do something more useful with it, however! To update information about your provider, we'll need to update the *manifest* file, and the source code and config.

1. Update the manifest file to contain your projects proper values.

The manifest file is called: `terraform-plugin.config.json`.

By default is should contain:

```json
{
  "type": "example",
  "namespace": "example",
  "version": "0.1.0",
  "entry": "plugin.js"
}
```
Set the "type" to you preferred provider's name, the namespace to a unique value (your name or your organization's name).

2. Update source code to reflect new provider.

In `plugin.js`, find the example provider:
```js
const exampleProvider = {
  name: 'example',
  attributes: [],
  resources: [exampleResource]
};
```
and change the "name" property to your new provider's name.

2. Re-install the plugin with it's new name. (You only need to do this if you've changed the manifest file)
```bash
node-terraform install
```
3. Update the config with your providers new name in `main.tf`
```hcl
terraform {
  required_providers {
    example = {                        // << --- change this
      source = "local/example/example" // << --- and this
      version = "0.1.0"
    }
  }
}
```

Now you've got a skeleton, and it should be named properly now. Check out the [CatSDK Guide](./guides/CatSDK) to continue and give a run-through of some of the ways you can use your terraform plugin to manage resources!