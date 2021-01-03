// @flow strict
const { EOL } = require('os');
const { base64RemovePadding } = require('./base64');

/*::
export type GoPluginCookieInfo = {
  protocolVersion: number,
  magicCookieKey: string,
  magicCookieValue: string,
};

export type GoPluginHandshake = {
  protocolVersion: 1,
  pluginVersion: string,
  transmissionType: string,
  path: ?string,
  clientProtocol: 'grpc',
  certificate: ?string,
};
*/

const isValidMagicCookie = (
  magicCookieKey/*: string*/,
  magicCookieValue/*: string*/,
)/*: boolean*/ => {
  return process.env[magicCookieKey] === magicCookieValue;
};

const handshakeToString = ({
  protocolVersion,
  pluginVersion,
  transmissionType,
  path,
  certificate
}/*: GoPluginHandshake*/)/*: string*/ => {
  return [
    protocolVersion,
    pluginVersion,
    transmissionType,
    path,
    'grpc',
    certificate && base64RemovePadding(certificate.split('\n').slice(1, -1).join('')),
  ].filter(Boolean).join('|') + EOL;
};

module.exports = {
  handshakeToString,
  isValidMagicCookie,
};
