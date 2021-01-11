// @flow strict
/*:: import type { AttributePath } from './attributePath'; */

const severities = {
  INVALID: 0,
  ERROR: 1,
  WARNING: 2,
};

/*::
export type Diagnostic = {
  severity: $Values<typeof severities>,
  summary: string,
  detail: string,
  attribute: AttributePath
}
*/

const createDiagnosticFromError = (error/*: Error*/)/*: Diagnostic*/ => ({
  severity: severities.ERROR,
  summary: error.message,
  detail: error.stack,
  attribute: { steps: [] },
});

module.exports = {
  severities,
  createDiagnosticFromError,
};
