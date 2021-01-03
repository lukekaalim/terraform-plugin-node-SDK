# `@lukekaalim/hashicorp-go-plugin`
An implementation of _https://github.com/hashicorp/go-plugin_

> go-plugin is a Go (golang) plugin system over RPC. It is the plugin system that has been in use by HashiCorp tooling for over 4 years. While initially created for Packer, it is additionally in use by Terraform, Nomad, and Vault.

This is a naive, mostly reverse-engineered implementation of Hashicorp's Go Plugin, written for node. It currently provides a Server implementation.

> ⚠️ This is a non-serious implementation, and has 0% test coverage. Use at your own risk. ⚠️

## Installation
Requirements:
 - `openssl` in your `$PATH`
 - ability to create unix sockets in `/tmp/*`

Install with your package manager

```bash
npm install @lukekaalim/hashicorp-go-plugin
```

## Getting Started with a __Plugin Server__
Before you start, we assume you have/know about these:
  1. The *Magic Cookie* key and values for the Go-Plugin server you're implementing
  2. The GRPC Service which your plugin will be exposing (and its version number)

With this library installed, create a plugin server.
```js
const { createGOPluginServer } = require('@lukekaalim/hashicorp-go-plugin');

const pluginServer = createGOPluginServer({
  pluginVersion: '5', // the version of your plugin
  magicCookieKey: '5435234', // the name of the env that contains the value
  magicCookieValue: '4555435', // the expected magic value
});
```

The server hasn't started yet, so now we can attach our special GRPC service. The [GRPC server](https://grpc.github.io/grpc/node/grpc.Server.html) is available as the `server` property, so we can attach our services there.

```js
pluginServer.server.addService(myService, myServiceImplementation);
// ...
// do whatever you want with the server here
```

Once our services are all added, we can start the server with the start function.
```js
pluginServer.start();
```
This will cause the server to emit it's *handshake* and bind itself to a unix port in `tmp` somewhere, and your client should now begin reading!

## API
### `createGOPluginServer`
```js
const { createGOPluginServer } = require('@lukekaalim/hashicorp-go-plugin');

const options = {
  pluginVersion, // string
  magicCookieKey, // string
  magicCookieValue // string
}
const pluginServer = createGOPluginServer(options);

const {
  start, // () => Promise<void>
  server, // GRPCServer
  close, // () => Promise<void>
  console, // Console
} = pluginServer;
```
The `server` property is an instance of a [GRPC server](https://grpc.github.io/grpc/node/grpc.Server.html), which you should attach your services before you start.

The `console` property contains a [Console](https://nodejs.org/api/console.html#console_class_console) instance, which you should write to, since STDOUT is typically consumed by the client application and not visible to the user. The output of this class is sent to the STDIO service of the client.

Throws:
 - `MagicCookieError`

## Understanding Go-Plugin
### Resources
  - https://github.com/hashicorp/go-plugin/blob/master/docs/internals.md
  - https://github.com/hashicorp/go-plugin/blob/master/docs/guide-plugin-write-non-go.md

### Brief Lifecycle of a Plugin
Hashicorp Go-Plugins are essentially programs that setup GRPC servers with a set of standardized services, and then emit a string in the standard output that indicates how to connect to it.

Plugins are used by "clients", which are typically larger programs that orchestrate the creation and communications of the plugin. Typically they read the output of the program to connect to the plugin's server and begin communication.

### Magic Cookie
The Magic Cookie is a special environment variable that is set up by the "client" program, which the plugin expects. If the Magic Cookie is not found (or is found to have a different value than expected), then typically the plugin has been run directly (by just running the executable) or has been run by a client that isn't compatible with this plugin.

This can then be used to show a nicer human readable error message, as plugins should be invoked by the client rather than a user directly.

In `@lukekaalim/hashicorp-go-plugin`'s case, it emits a `MagicCookieError` when `createGOPluginServer` is called with an invalid cookie.

## TODO
- A Client Implementation
- Add non-unix pipe server endpoints
- Tests
- Proper handling of healthchecks
- Unified console handling 