---
layout: default
title: CatSDK
parent: Guides
nav_order: 2
---
# CatSDK Guide

In this guide, we'll give a fast run through of a plugin  cats as an example. The completed project is available [in the repository `/examples/cat` folder](https://github.com/lukekaalim/terraform-plugin-node-SDK/tree/master/examples/cat).

## Setup
Create a new folder called "cathouse"
```bash
mkdir cathouse
```
And create a new terraform plugin in there
```bash
node-terraform init
```

## The Cat SDK
Normally, with a terraform resource, you manage a remote API. For our example however, the resources we'll be managing will just be "files" on our local computer.

More specifically, lets say a "Cat" is a JSON file with an id, color and nickname. The ID is randomly generated (no cats can have the same id). A "Cat" lives in a "Cathouse", which is a directory. The cat's filename is just it's ID as well, for ease.

Heres a Cat:
```json
{
  "id": "hrfb89p2ke345",
  "color": "light brown",
  "nickname": "Mr Smiggles"
}
```
Here some cats in the cathouse
```bash
> ls ./cathouse

hrfb89p2ke345.json
dfljbjdkbg983.json
4958huj45l6kn.json
```

You can have more that one cat in a cathouse, if you like. There are no other rules.

Lets create a class that can handle this behavior. We'll call it the CatSDK, since it's essentially an SDK to handle cats. We should be able to:
 - Create a Cat
 - Update a Cat's Nickname or Color
 - Find a Cat by it's ID
 - Remove a Cat (no cats are harmed, I promise)

The SDK will operate on one cathouse at a time.

Lets model the operations using CRUD-like syntax.

```js
// catSDK.js
const { writeFile, readFile, unlink } = require('fs').promises;

class CatSDK {
  constructor(cathouse) {
    this.cathouse = cathouse;
  }
  async create() {
    // todo
  }
  async update() {
    // todo
  }
  async read() {
    // todo
  }
  async destroy() {
    // todo
  }
}

module.exports = {
  CatSDK,
};
```

Let write a function that creates cats. We know that each cat should have a unique id. Lets use the [nanoid package](https://github.com/ai/nanoid) to create ids.

```bash
npm i nanoid
```

```js
// catSDK.js
const { writeFile, readFile, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');

class CatSDK {
  // ... constructor
  async create(nickname, color) {
    const newCat = {
      nickname,
      color,
      id: nanoid(),
    };
    await writeFile(
      this.cathouse + '/' + newCat.id + '.json',
      JSON.stringify(newCat, null, 2)
    );
    return newCat;
  }
```
We just create a cat out of a JSON object, write it to file, and return the cat.

We'll do the same for updating as well, you just need to provide the ID this time

```js
  async update(id, nickname, color) {
    const updatedCat = {
      nickname,
      color,
      id,
    };
    await writeFile(
      this.cathouse + '/' + updatedCat.id + '.json',
      JSON.stringify(updatedCat, null, 2)
    );
    return updatedCat;
  }
```
Reading will just return the contents of the file. We're being lax here since:
  1. We don't do any checking if the ID even exists
  2. You don't check anything about the returned object's schema.

But it should be fine for now.

```js
  async read(id) {
    const fileContents = await readFile(
      this.cathouse + '/' + id + '.json',
      'utf-8'
    );
    const cat = JSON.parse(fileContents);
    return cat;
  }
```
To "destroy" a cat, we'll just unlink the file.
```js
  async read(id) {
    await unlink(
      this.cathouse + '/' + id + '.json',
    );
    return null;
  }
```

We should now have a file that looks like:

```js
// catSDK.js
const { writeFile, readFile, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');

class CatSDK {
  constructor(cathouse) {
    this.cathouse = cathouse;
  }
  async create(nickname, color) {
    const newCat = {
      nickname,
      color,
      id: nanoid(),
    };
    await writeFile(
      this.cathouse + '/' + newCat.id + '.json',
      JSON.stringify(newCat, null, 2)
    );
    return newCat;
  }
  async update(id, nickname, color) {
    const updatedCat = {
      nickname,
      color,
      id,
    };
    await writeFile(
      this.cathouse + '/' + updatedCat.id + '.json',
      JSON.stringify(updatedCat, null, 2)
    );
    return updatedCat;
  }
  async read(id) {
    const fileContents = await readFile(
      this.cathouse + '/' + id + '.json',
      'utf-8'
    );
    const cat = JSON.parse(fileContents);
    return cat;
  }
  async destroy(id) {
    await unlink(
      this.cathouse + '/' + id + '.json',
    );
    return null;
  }
}

module.exports = {
  CatSDK,
};
```

## The Provider
Now: lets use terraform to model our resources declaratively.

Our provider will be called the "cathouse" provider, and it should expose a "cathouse_cat" resource.

Update our `plugin.js` file (the entry point to our plugin) to include a new type of resource.

This resource should model what a "Cat" is:
 - It should have a nickname attribute
 - It should have a color attribute
 - It should also have an ID attribute, that's is decided by the CatSDK

It's important to mark the ID as "computed", as you shouldn't be able to input your own ID.

```js
const catResource = {
  name: 'cat',
  attributes: [
    { name: 'id', type: 'string', computed: true },
    { name: 'nickname', type: 'string', required: true },
    { name: 'color', type: 'string', required: true },
  ],
};
```

Make sure to add the catResource to the provider. We also should add a attribute that lets us known the cathouse we're working on
```js
const cathouseProvider = {
  name: 'cathouse',
  attributes: [
    { name: 'cathousePath', type: 'string', required: true },
  ],
  resources: [catResource]
};
```

(and make sure we're still using the provider in our plugin)

```js
const plugin = createPlugin(cathouseProvider);

plugin.start();
```

The provider should work, but doesn't do anything yet. We need to implement some functions. Lets start with provider configuration.

## Provider Lifecycle
Before terraform runs plan, apply, or anything that uses a resource, it runs a "configure" function. We can set up the SDK there, and access that same instance in plan or apply.

The return value of 'configure' will be the SDK, and the argument it the attributes that the user will have filled in.

```js
const { CatSDK } = require('./catSDK.js');

const cathouseProvider = {
  name: 'cathouse',
  attributes: [
    { name: 'cathousePath', type: 'string', required: true },
  ],
  resources: [catResource],
  async configure(providerConfig) {
    const cathouse = providerConfig.cathousePath;
    return new CatSDK(cathouse);
  }
};
```
Now, let's use fill in the Plan, Apply, and Read methods with the SDK.

## Resource Lifecycle

For "plan", we need to describe what the resource "will" look like, once we apply. However, we don't know the ID of the cat until we actually create it, so we need to mark it as "unknown".

When we are creating the resource, the state will be null, but if we're just planning an update, the state will be the the last recoding of the cat.

The config is the current filled-in attributes by the user, so these will contain the nickname and color.

And the configuredProvider is actually the CatSDK instance we returned in the "configure" function. We don't need it yet, since we wont be calling any functions in planning.

```js
const { Unknown, createPlugin } = require('@lukekaalim/terraform-plugin');

const catResource = {
  // ...
  async plan(state, config, configuredProvider) {
    return {
      id: state?.id || new Unknown(),
      nickname: config.nickname,
      color: config.color
    }
  }
};
```

For "apply", it's the same thing, except instead of the "config" we just have access to the plan we created. We also can have a helper function here that can determine if we're performing an update, creation or destruction operation (`getPlanType`), which makes the code easier to read.

```js
const { Unknown, createPlugin, getPlanType } = require('@lukekaalim/terraform-plugin');

const catResource = {
  // ...
  async apply(state, plan, configuredProvider) {
    switch (getPlanType(state, plan)) {
      case 'create':
        return await configuredProvider.create(
          plan.nickname,
          plan.color
        );
      case 'update':
        return await configuredProvider.update(
          state.id,
          plan.nickname,
          plan.color
        );
      case 'destroy':
        return await configuredProvider.destroy(
          state.id
        );
    }
  }
}
```

Now, we haven't coded it yet, but someone could edit a cat while we're not looking, updating it's nickname or color directly in the JSON. This is a valid case (called "configuration drift") when the state that terraform stores isn't always what's true in the _real world_.

To help avoid that, we can implement a "read" function that terraform will use the get the true state of any cat.

```js
const { Unknown, createPlugin, getPlanType } = require('@lukekaalim/terraform-plugin');

const catResource = {
  // ...
  async read(state, configuredProvider) {
    return await configuredProvider.read(state.id);
  }
}
```

Perfect! We're now actually done writing the provider. Lets test it out first though. In our `main.tf` file, lets update it to include the attributes we marked as required in a provider configuration block, and add in some cats!

(Make sure to create a "cathouse" first, as our code expects it to be there!)
```
mkdir cathouse
```

Lets start with the provider.

```hcl
terraform {
  required_providers {
    cathouse = {
      source = "local/example/cathouse"
      version = "0.1.0"
    }
  }
}

provider "cathouse" {
  cathousePath = "./cathouse"
}
```

And lets create two cats!

```hcl
resource "cathouse_cat" "smiggles" {
  nickname = "Mr Smiggles"
  color = "Light Brown"
}

resource "cathouse_cat" "jenkins" {
  nickname = "Old Man Jenkins"
  color = "Black"
}
```

Now, lets try it out with a `terraform plan`. If everything went well, you should see:
```bash
An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # cathouse_cat.jenkins will be created
  + resource "cathouse_cat" "jenkins" {
      + color    = "Black"
      + id       = (known after apply)
      + nickname = "Old Man Jenkins"
    }

  # cathouse_cat.smiggles will be created
  + resource "cathouse_cat" "smiggles" {
      + color    = "Light Brown"
      + id       = (known after apply)
      + nickname = "Mr Smiggles"
    }

Plan: 2 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------

Note: You didn't specify an "-out" parameter to save this plan, so Terraform
can't guarantee that exactly these actions will be performed if
"terraform apply" is subsequently run.
```

Looks good! Let's apply with `terraform apply --auto-approve`

```bash
cathouse_cat.jenkins: Creating...
cathouse_cat.smiggles: Creating...
cathouse_cat.jenkins: Creation complete after 0s [id=7FSJQIDsXu6iK6Iux9E43]
cathouse_cat.smiggles: Creation complete after 0s [id=NrMgeAMWg_o3Xgt4tkbI-]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
```
Victory! Lets double check
```bash
ls cathouse
```
```
7FSJQIDsXu6iK6Iux9E43.json      NrMgeAMWg_o3Xgt4tkbI-.json
```
And inspect an individual cat at random
```
cat cathouse/7FSJQIDsXu6iK6Iux9E43.json
```
```
{
  "nickname": "Old Man Jenkins",
  "color": "Black",
  "id": "7FSJQIDsXu6iK6Iux9E43"
}
```
You're id's should be different, but otherwise, yea! Nice work!