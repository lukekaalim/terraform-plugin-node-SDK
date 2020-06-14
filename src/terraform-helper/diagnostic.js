const createAttributePath = (attributeName) => {
  const steps = attributeName.split('.')
    .map(attributeFragment => ({ attributeName: attributeFragment }));
  
  return {
    steps,
  };
};

const createDiagnostic = (attributeName, summary = '', detail = '', severity = 'ERROR') => {
  return {
    attribute: createAttributePath(attributeName),
    summary,
    detail,
    severity,
  }
};

module.exports = {
  createDiagnostic,
};