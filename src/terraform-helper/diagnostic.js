class DiagnosticError extends Error {
  summary;
  attribute;
  severity;
  detail;

  constructor(summary, attribute, severity = 'ERROR', detail = null) {
    this.summary = summary;
    this.attribute = attribute;
    this.severity = severity;
    this.detail = detail;
  }
}

class DiagnosticErrorCollection extends Error {
  diagnostics;

  constructor(diagnostics) {
    this.diagnostics = diagnostics;
  }
}


const createAttributePath = (attributeName) => {
  const steps = attributeName.split('.')
    .map(attributeFragment => ({ attributeName: attributeFragment }));
  
  return {
    steps,
  };
};

const createDiagnostic = (attribute, summary = '', detail = '', severity = 'ERROR') => {
  return {
    attribute: createAttributePath(attribute),
    summary,
    detail,
    severity,
  }
};

const createDiagnosticsFromError = (error) => {
  if (error instanceof DiagnosticError)
    return [createDiagnostic(error.attribute, error.summary, error.detail, error.severity)];
  if (error instanceof DiagnosticErrorCollection)
    return error.diagnostics
      .map(createDiagnosticsFromError)
      .reduce((acc, curr) => [...acc, ...curr], []);
  
  return [createDiagnostic(
    '.',
    'Unknown error type',
    `The plugin threw an unexpected error: ${error.stack}`,
    'ERROR'
  )];
};

module.exports = {
  createDiagnostic,
  DiagnosticError,
  DiagnosticErrorCollection,
  createDiagnosticsFromError,
};