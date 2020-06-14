const { createResource, createSchema, createAttribute, createUnknownValue } = require('@lukekaalim/terraform-plugin-sdk');

const fileSchema = createSchema([
  createAttribute({
    name: 'id',
    type: 'string',
    description: 'The Unique ID of this file',
    computed: true,
  }),
  createAttribute({
    name: 'name',
    type: 'string',
    description: 'The name of the file',
    optional: true,
  }),
], 2);

const fileResource = createResource({
  name: 'google-drive_file',
  schema: fileSchema,
  version: 2,
  upgrade(provider, version, state) {
    switch (version.low) {
      default:
      case 1:
        return { id: state.id, name: createUnknownValue() };
      case 2:
        return state;
    }
  },
  async read({ drive }, state) {
    if (!state)
      return null;
    const { data: file } = await drive.files.get({ fileId: state.id });
    return {
      id: file.id,
      name: file.name,
    };
  },
  async plan({ drive }, config, oldState, proposedState) {
    if (!oldState) {
      // if no old state, then we should create
      return {
        ...proposedState,
        id: createUnknownValue(),
      };
    } else if (!proposedState) {
      // if no new state, then we should destroy
      return null
    } else {
      // if both, then we update, but preserve the immutable aspects
      return {
        ...proposedState,
        id: oldState.id,
      };
    }
  },
  async apply({ drive }, config, state, plan) {
    if (!state) {
      // create
      const { data: file } = await drive.files.create({ resource: { name: plan.name } });
      return {
        name: file.name,
        id: file.id,
      };
    } else if (!plan) {
      // delete
      const { id } = state;
      await drive.files.delete({ fileId: id });
      return null
    } else {
      // update
      const { id } = state;
      const { data: file } =await drive.files.update({ fileId: state.id, resource: { name: plan.name } });
      return {
        name: file.name,
        id: file.id,
      };
    }
  }
});

module.exports = {
  fileResource,
};