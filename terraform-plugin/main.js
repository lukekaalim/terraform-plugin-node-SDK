// @flow strict
/*::
export type * from '@lukekaalim/terraform-service';
export type * from './attribute';
export type * from './plugin';
export type * from './provider';
export type * from './resource';
export type * from './schema';
export type * from './utility';
*/

module.exports = {
  ...require('@lukekaalim/terraform-service'),
  ...require('./attribute'),
  ...require('./plugin'),
  ...require('./provider'),
  ...require('./resource'),
  ...require('./schema'),
  ...require('./utility'),
};

