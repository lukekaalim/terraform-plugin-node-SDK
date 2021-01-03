// @flow strict
const { encode, decode, createCodec } = require('msgpack-lite');

/*::
export opaque type DynamicValue = {
  msgpack: ?Buffer,
  json: ?Buffer,
};
*/

class Unknown {}

function unknownPacker() {
  return encode([0]);
}

function unknownUnpacker() {
  return new Unknown();
}

const codec = createCodec();
codec.addExtPacker(0, Unknown, unknownPacker);
codec.addExtUnpacker(0, unknownUnpacker);

const setPackedDynamicValue = (value/*: mixed*/)/*: DynamicValue*/ => {
  return {
    msgpack: encode(value, { codec }),
    json: null,
  };
};

const setJSONDynamicValue = (value/*: mixed*/)/*: DynamicValue*/ => {
  return {
    msgpack: null,
    json: Buffer.from(JSON.stringify(value) || '', 'utf-8')
  };
};

const getDynamicValue = (dynamicValue/*: DynamicValue*/)/*: any*/ => {
  const { msgpack: packedValue, json: jsonValue } = dynamicValue;
  if (packedValue)
    return decode(packedValue, { codec })
  if (jsonValue)
    return JSON.parse(jsonValue.toString('utf-8'));

  throw new Error('This value is too dynamic!');
};

module.exports = {
  Unknown,
  setPackedDynamicValue,
  setJSONDynamicValue,
  getDynamicValue,
};