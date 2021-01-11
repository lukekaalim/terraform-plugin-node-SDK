// @flow
/*:: import type { Cat } from './catSDK'; */
const { createPlugin, createSimpleResource, Unknown, createSimpleSchema, types } = require('@lukekaalim/terraform-plugin');
const { CatSDK } = require('./catSDK');

/*::
type Plan = {
  nickname: string,
  color: string,
};
type State = Cat;
*/

const catResource = createSimpleResource/*:: <Plan, State, CatSDK>*/({
  name: 'cat',
  simpleSchema: {
    required: {
      nickname: types.string,
      color: types.string,
    },
    computed: {
      id: types.string,
    }
  },
  configure(sdk) {
    const create = async (plan) => {
      return await sdk.create(plan.nickname, plan.color);
    };
    const update = async (state, plan) => {
      return await sdk.update(state.id, plan.nickname, plan.color);
    };
    const read = async (state) => {
      return await sdk.read(state.id)
    };
    const destroy = async (state) => {
      return await sdk.destroy(state.id);
    };
    return {
      create,
      update,
      read,
      destroy,
    }
  },
});

const catteryProvider = {
  name: 'cattery',
  schema: createSimpleSchema({
    required: { cattery_path: types.string, },
  }),
  resources: [catResource],
  async configure(providerConfig) {
    const cattery = providerConfig.cattery_path;
    return new CatSDK(cattery);
  }
};

const plugin = createPlugin(catteryProvider);

plugin.start();
