const { createProvider, createSchema, types } = require('@lukekaalim/terraform-plugin-sdk');
const { google } = require('googleapis');

const googleDriveSchema = createSchema({
  client_secret: { type: types.string },
  client_id: { type: types.string },
  redirect_uris: { type: types.list(types.string) },
  token: { type: types.object({
    access_token: types.string,
    refresh_token: types.string,
    scope: types.string,
    token_type: types.string,
    expiry_date: types.number,
  }) },
});

const googleDriveProvider = createProvider({
  name: 'google-drive',
  schema: googleDriveSchema,
  configure({ client_secret, client_id, redirect_uris, token }) {

    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth });

    return { drive };
  }
});

module.exports = {
  googleDriveProvider,
};