const fs = require('fs');
const { readFile, writeFile } = require('fs').promises;
const readline = require('readline');
const {google} = require('googleapis');

// https://developers.google.com/identity/protocols/oauth2/scopes#drive
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const main = async () => {
  const { installed: {
    client_secret,
    client_id,
    redirect_uris
  } } = JSON.parse(await readFile('credentials.json'));

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = await new Promise(res => {
    getAccessToken(oAuth2Client, token => res(token));
  });

  await writeFile('google.auto.tfvars.json', JSON.stringify({
    client_secret,
    client_id,
    redirect_uris,
    token,
  }, null, 2));
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      console.log('token', token);
      callback(token);
    });
  });
}

main();