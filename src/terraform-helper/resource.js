const { createSchema } = require('./schema');

const defaultResource = {
  version: 1,
  block: createSchema({}),
  validate(provider, config) {
    return;
  },
  read(provider, state) {
    return state;
  },
  plan(provider, state, config, plan) {
    return plan;
  },
  create(provider, config) {
    return config;
  },
  update(provider, state, config) {
    return config;
  },
  delete(provider, state) {
    return;
  },
  upgrade(version, state) {
    return state;
  },
  import(provider, id) {
    return [];
  }
};

const createResource = (resource) => {
  if (!resource.name)
    throw new Error('Resource needs name');
  
  return {
    ...defaultResource,
    ...resource,
  };
};

module.exports = {
  createResource,
};
