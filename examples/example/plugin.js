const {
  createPlugin,
  getPlanType,
  Unknown,
 } = require('@lukekaalim/terraform-plugin');

const exampleResource = {
  name: 'resource',
  attributes: [
    { name: 'id', type: 'string', computed: true },
    { name: 'name', type: 'string', required: true },
  ],
  async plan(state, config) {
    return {
      id: state?.id || new Unknown(),
      name: config.name,
    }
  },
  async apply(state, plan) {
    switch (getPlanType(state, plan)) {
      case 'create':
        // create resource here
        return { id: 'new-generated-id', name: plan.name };
      case 'update':
        // update resource here
        return { ...state, name: plan.name };
      case 'destroy':
        // destroy resource here
        return null;
    }
  }
};
const exampleProvider = {
  name: 'example',
  attributes: [],
  resources: [exampleResource]
};

const examplePlugin = createPlugin(exampleProvider);

examplePlugin.start();