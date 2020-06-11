const { unpack, pack } = require('msgpack');

const setPackedDynamicValue = (value) => {
  return {
    msgpack: pack(value),
    json: null,
  };
};

const setJSONDynamicValue = (value) => {
  return {
    msgpack: null,
    json: Buffer.from(JSON.stringify(value), 'utf-8')
  };
};

const getDynamicValue = (dynamicValue) => {
  const { msgpack: packedValue, json: jsonValue } = dynamicValue;
  if (packedValue)
    return unpack(packedValue)
  if (jsonValue)
    return JSON.parse(jsonValue.toString('utf-8'));

  throw new Error('This value is too dynamic!');
};

module.exports = {
  setPackedDynamicValue,
  setJSONDynamicValue,
  getDynamicValue,
};