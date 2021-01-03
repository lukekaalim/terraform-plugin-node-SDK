// @flow strict
/*:: import type { GRPCServiceImplementationMap, GRPCServiceDefinition } from '@grpc/grpc-js'; */
/*:: import type { GRPCUnaryHandler, GRPCServerStreamHandler, Server } from '@grpc/grpc-js'; */

/*::
export type * from './services/controllerService';
export type * from './services/healthcheckService';
export type * from './services/stdioService';
*/

/*::
export type Service = {
  definition: GRPCServiceDefinition,
  implementation: GRPCServiceImplementationMap,
};
*/
const addServiceToServer = (service/*: Service*/, server/*: Server*/) => {
  server.addService(service.definition, service.implementation);
};

module.exports = {
  ...require('./services/controllerService'),
  ...require('./services/healthcheckService'),
  ...require('./services/stdioService'),
  addServiceToServer,
};


