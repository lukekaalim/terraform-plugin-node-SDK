// @flow strict

/*::
declare module "msgpack-lite" {
  declare class Codec {
    addExtPacker(number, mixed, mixed): void;
    addExtUnpacker(number, mixed): void;
  }

  declare function encode(input: mixed, options: ?{ codec?: Codec }): void;
  declare function decode(input: Buffer, options: ?{ codec?: Codec }): mixed;
  declare function createCodec(): Codec;

  declare module.exports: {
    createCodec: typeof createCodec,
    decode: typeof decode,
    encode: typeof encode,
  }
}
*/