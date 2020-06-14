const { createProvider, createSchema, createAttribute } = require('@lukekaalim/terraform-plugin-sdk');
const { google } = require('googleapis');

const tokenType = [
  'object',
  {
    access_token: 'string',
    refresh_token: 'string',
    scope: 'string',
    token_type: 'string',
    expiry_date: 'number',
  }
];

const schema = createSchema([
  createAttribute({ name: 'client_secret', required: true }),
  createAttribute({ name: 'client_id', required: true }),
  createAttribute({ name: 'redirect_uris', type: ['list', 'string'], required: true }),
  createAttribute({ name: 'token', type: tokenType, required: true }),
]);

const googleDriveProvider = createProvider({
  schema,
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