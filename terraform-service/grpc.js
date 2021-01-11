// @flow strict

/*::
export type UnaryHandler = (
  call: { request: mixed },
  callback: (error: ?Error, response: ?mixed) => void,
) => mixed;
*/

const createGRPCUnaryHandler = (
  asyncHandler/*: any => Promise<any>*/
)/*: UnaryHandler*/ => async (
  call,
  callback
)/*: Promise<void>*/ => {
  try {
    callback(null, await asyncHandler(call.request));
  } catch (error) {
    callback(error);
  }
};

module.exports = {
  createGRPCUnaryHandler,
};
