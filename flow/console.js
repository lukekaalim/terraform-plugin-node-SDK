// @flow strict
/*::
declare module "console" {
  import type { Writable } from 'stream';
  declare interface ConsoleLike {
    log(...data: Array<any>): void
  }

  declare class Console implements ConsoleLike {
    constructor(stdout: Writable, stderr?: Writable): Console;
    log(...data: Array<any>): void;
  }

  declare module.exports: {
    Console: typeof Console,
  };
}
*/