// @flow strict
/*
GO (the language) does weird thing with base64 padding
that isn't strictly in the spec, I think.
*/

const base64RemovePadding = (base64String/*: string*/)/*: string*/ => {
  return base64String.replace(/={1,2}$/, '');
}

const base64AddPadding = (base64String/*: string*/)/*: string*/ => {
  return Buffer.from(base64String, 'base64').toString('base64');
};

module.exports = {
  base64RemovePadding,
  base64AddPadding,
};
