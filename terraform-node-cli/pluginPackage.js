// @flow strict
const os = require('os');

/*::
type TerraformPluginPackage = {
  organization: string,
  namespace: string,
  providerType: string,
  version: string,
  operatingSystem: string,
};
*/

const getOSArch = () => {
  switch (os.arch()) {
    case 'x64':
      return 'amd64';
    case 'x32':
      return '386';
  }
}

const getOSType = () => {
  return os.type().toLowerCase();
};

const getOperatingSystem = () => {
  return [getOSType(), getOSArch()].join('_');
};

const createPluginPackage = (package/*: { [string]: string }*/)/*: TerraformPluginPackage*/ => {
  const [packageName, packageScope = '@plugins'] = package.name.split('/').reverse(); 
  const organization = package.author;
  const namespace = packageScope.slice(1);
  const providerType = packageName;
  const version = package.version;
  const operatingSystem = getOperatingSystem();
  return {
    organization,
    namespace,
    providerType,
    version,
    operatingSystem,
  };
}

module.exports = {
  createPluginPackage,
};