// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { createPlugin, types, Unknown, createApplyFunction, toUnknown } = require('@lukekaalim/terraform-node-sdk');
const { toString, toObject, toNullable } = require('@lukekaalim/cast');

const { toCat, CatSDK } = require('./catSDK');

/*::
export type ProviderConfig = {|
  directory: string,
|};
export type CatConfig = {|
  nickname: null | string,
  color: null | string,
|};
export type CatPlan = {|
  id: string | Unknown,
  nickname: string,
  color: string,
|};
*/

const toProviderConfig/*: Cast<ProviderConfig>*/ = (value) => {
  const object = toObject(value);
  return {
    directory: toString(object.directory),
  };
};
const toCatPlan/*: Cast<CatPlan>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toUnknown(object.id, toString),
    nickname: toString(object.nickname),
    color: toString(object.color),
  }
};
const toCatConfig/*: Cast<CatConfig>*/ = (value) => {
  const object = toObject(value);
  return {
    nickname: toNullable(object.nickname, toString),
    color: toNullable(object.color, toString),
  }
};

const plugin = createPlugin({
  name: 'cats',
  version: 1,
  attributes: [
    { name: 'directory', type: types.string, required: true }
  ],
  async configure(configValue) {
    const { directory } = toProviderConfig(configValue);
    return new CatSDK(directory)
  },
  resources: [{
    name: 'cat',
    version: 1,
    attributes: [
      { name: 'id', type: types.string, computed: true },
      { name: 'nickname', type: types.string, required: true },
      { name: 'color', type: types.string, required: true },
    ],
    async read(state, prov) {
      const { id } = toCat(state);
      return await prov.read(id);
    },
    async plan(state, config) {
      const { id } = state ? toCat(state) : {};
      const { nickname, color } = toCatConfig(config);
      return {
        nickname,
        color,
        id: id || new Unknown(),
      };
    },
    apply: createApplyFunction({
      toState: toCat,
      toPlan: toCatPlan,
      async create(plan, provider) {
        return await provider.create(plan.color, plan.nickname);
      },
      async update(state, plan, provider) {
        return await provider.update(state.id,
            plan.color,
            plan.nickname
        );
      },
      async destroy(state, provider) {
        await provider.destroy(state.id);
        return null;
      },
    }),
  }],
});

plugin.start();