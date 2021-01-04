# `@lukekaalim/terraform-cli`

A CLI utility tool to help manage node terraform plugins. Installs as the program:
```bash
node-terraform
```
Can link local plugins into a filesystem registry for quick testing, or build deployable and signed binaries for uploading to the terraform registry, or even build an empty scaffold program.

## Installation
Requirements:
  - `gpg` in your `$PATH` if you want to create signed releases

```bash
npm i -g @lukekaalim/terraform-cli
# or, if installing locally
npm i -D @lukekaalim/terraform-cli
```
## Manifest
The Terraform Plugin Manifest is an important file in a terraform project, containing metadata for how your plugin functions. It should be called `terraform-plugin.config.json`, and put in the root of package (next to your `package.json`). It should have at least the following shape:

```js
{
  "type": string,
  "namespace": string,
  "version": string,
  "entry": string,
}
```

The "type" of the plugin should match the name of the provider, and the "namespace" can be anything from the author/organization or any other top-level unique group you want to publish the plugin under.

The "version" is a sem-ver string, and the "entry" should be a path relative to the manifest that leads to a valid terraform plugin program in javascript.

Here's an example of a manifest:
```json
{
  "type": "example",
  "namespace": "lukekaalim",
  "entry": "./plugin.js",
  "version": "1.0.0"
}
```

## Commands
### Init
```bash
node-terraform init
```
Creates a empty project in the working directory, overwriting existing files if required, and then installs that project. The project will be called the name of the working directory and the namespace is "example".

It will also create a skeleton terraform configuration, and initialize that as well.

### Manifest
```bash
node-terraform manifest
```
Prints the Terraform Plugin Manifest in the working directory.

### Install
```bash
node-terraform install
```
Install the package as a terraform provider in a filesystem registry.

More specifically, it creates a small javascript file that "requires" the local project's entry point. This file is placed in:
```js
`~/.terraform.d/plugins/local/${namespace}/${type}/${version}/${operatingSystem}/terraform-provider-${type}_${version}`
```
This adds it as a valid provider for a default [terraform filesystem mirror registry](https://www.terraform.io/docs/commands/cli-config.html#filesystem_mirror), and so will be available in terraform as the following provider:
```js
`local/${namespace}/${type}`
```

For Example:
```json
{
  "type": "example",
  "namespace": "example",
  "entry": "./plugin.js",
  "version": "1.0.0"
}
```
on Luke Kaalim's macos will be installed into
`/Users/lukekaalim/.terraform.d/plugins/local/example/example/1.0.0/darwin_amd64/terraform-provider-example_1.0.0`, and can be used in a terraform configuration with
```hcl
terraform {
  required_providers {
    example = {
      source = "local/example/example"
      version = "1.0.0"
    }
  }
}
```

### Build
```bash
node-terraform build [destination]
```
Creates distributable and _signed_ terraform provider archives and shasums, ready for publishing to the terraform store.

The files will be placed inside the *destination* argument, which should be a directory. If destination isnt provided, then its placed in a directory called "release" in the working directory. If it doesn't exist, it will be created.

More specifically, it follows the procedure documented in the [Manually Preparing a Release](https://www.terraform.io/docs/registry/providers/publishing.html#manually-preparing-a-release) document:
  1. Creates a Binary for all the release platforms (linux_64x and darwin_64x for now) using [pkg](https://www.npmjs.com/package/pkg)
  2. Creates Archives containing those binaries in the target directory
  3. Creates a `SHA256SUMS` file, containing SHA256 hashes of the archives
  4. Creates a detached signature of the file by running `gpg --detach-sig ${shasum-file}`

These files can then be uploaded to a github release as part of the provider publishing workflow either in automation or manually. 

Note that step 4 just shells out to the GPG executable on your path, which may ask you to perform additional steps.