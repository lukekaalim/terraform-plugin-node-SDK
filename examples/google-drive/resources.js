const { createResource, createSchema, types } = require('@lukekaalim/terraform-plugin-sdk');

const fileSchema = createSchema({
  id: {
    type: types.string,
    description: 'The Unique ID of this file',
    computed: true
  },
  name: {
    type: types.string,
    description: 'The name of the file',
    computed: true,
    optional: true
  },
}, 2);

const fileResource = createResource({
  name: 'file',
  block: fileSchema,
  version: 2,
  upgrade({ drive }, version, state) {
    switch (version.low) {
      case 1:
        return { id: state.id, name: '' };
      default:
        return state;
    }
  },
  async read({ drive }, state) {
    const { data: file } = await drive.files.get({
      fileId: state.id
    });
    return file;
  },
  async create({ drive }, config) {
    const { data: file } = await drive.files.create({
      resource: { name: plan.name }
    });
    return file;
  },
  async update({ drive }, state, config) {
    const { data: file } = await drive.files.update({
      fileId: state.id,
      resource: { name: config.name }
    });
    return file;
  },
  async delete({ drive }, state) {
    await drive.files.delete({ fileId: state.id });
    return null;
  },
});

module.exports = {
  fileResource,
};