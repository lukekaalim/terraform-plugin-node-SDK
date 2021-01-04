
const { createPlugin, Unknown, getPlanType } = require('@lukekaalim/terraform-plugin');
const { CatSDK } = require('./catSDK.js');

const catResource = {
  name: 'cat',
  attributes: [
    { name: 'id', type: 'string', computed: true },
    { name: 'nickname', type: 'string', required: true },
    { name: 'color', type: 'string', required: true },
  ],
  async plan(state, config, configuredProvider) {
    return {
      id: state?.id || new Unknown(),
      nickname: config.nickname,
      color: config.color
    }
  },
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
  },
  async read(state, configuredProvider) {
    return await configuredProvider.read(state.id);
  }
};
const catteryProvider = {
  name: 'cattery',
  attributes: [
    { name: 'catteryPath', type: 'string', required: true },
  ],
  resources: [catResource],
  async configure(providerConfig) {
    const cattery = providerConfig.catteryPath;
    return new CatSDK(cattery);
  }
};

const plugin = createPlugin(catteryProvider);

plugin.start();
