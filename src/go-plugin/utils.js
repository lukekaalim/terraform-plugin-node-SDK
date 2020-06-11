const base64RemovePadding = (base64String) => {
  return base64String.replace(/={1,2}$/, '');
}

const base64AddPadding = (base64String) => {
  return Buffer.from(base64String, 'base64').toString('base64');
};

module.exports = {
  base64RemovePadding,
  base64AddPadding,
};
