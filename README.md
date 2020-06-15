# `@lukekaalim/terraform-plugin-sdk`
This project is an npm package that provides tools for building Terraform Plugins.

Terraform plugins can be used to leverage and extend terraform capabilities, allowing new providers and resource types.

## What's a Plugin?
All of terraform's ability to interact with API's comes from [_plugins_](https://www.terraform.io/docs/plugins/index.html). Terraform manages the configuration, orchestration, and dependency resolution on the resources you create, but it's a terraform plugin that allows it to interact with the world.

A plugin composes of an _executable file_ that perform a hashicorp/go-plugin handshake and then opens up a GRPC server.

That GRPC server then implements the terraform-plugin prototypes, providing a Schema (which is a declaration of the provider and all resources that provider manages) and some functions that terraform calls to create or apply terraform plans.

The Terraform Plugin SDK allows you to create plugins declaratively, allowing you create a plugin without needing to perform all the boilerplate work.

## Why create Plugins?
Terraform has a wealth of plugins available to it already created that allow you to manage a vast amount of resources in an interconnected graph, but it doesn't have all of them.

When using terraform, you may wish to:
- Create resources that talk to a proprietary or internal API
- Create resource for an API that doesn't have a provider yet
- Manage a resource for an existing provider that doesn't provide certain functionality
- Disagree with the implementation of an API and want to give yourself greater flexibility
- Model existing build scripts a declarative structures?

## Documentation

Take a look at our [guides](docs/guides.md), our [api](docs/api.md) or some [examples](examples/readme.md).
