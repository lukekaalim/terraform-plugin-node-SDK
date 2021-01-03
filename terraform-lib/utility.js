// @flow strict
/*:: import type { Plan, Configuration, State, Value } from './main'; */
const { Unknown } = require('@lukekaalim/terraform-service');

/*::
export type Diff =
  | 'destroy'
  | 'update'
  | 'create'
*/

const getDiff = (state/*: null | State*/, plan/*: null | Plan | Configuration*/)/*: Diff*/ => {
  if (!plan)
    return 'destroy';
  if (!state)
    return 'create';
  return 'update';
};
/*::
type ApplyHandlers<Provider, TPlan, TState> = {
  toPlan: mixed => TPlan,
  toState: mixed => TState,
  create: (plan: TPlan, provider: Provider) => Promise<State>,
  destroy: (state: TState, provider: Provider) => Promise<null>,
  update: (state: TState, plan: TPlan, provider: Provider) => Promise<State>,
};
*/

const createApplyFunction =
  /*::<P, T1, T2>*/(handlers/*: ApplyHandlers<P, T1, T2>*/)/*: (state: null | State, plan: null | Plan, provider: P) => Promise<null | State>*/ =>
  async (state, plan, provider) =>
  {
    const { create, update, destroy, toPlan, toState } = handlers;
    if (!state && plan)
      return await create(toPlan(plan), provider);
    if (!plan && state)
      return await destroy(toState(state), provider);
    if (plan && state)
      return await update(toState(state), toPlan(plan), provider);
    throw new Error();
  };

const toUnknown = /*:: <T>*/(value/*: mixed*/, cast/*: mixed => T*/)/*: T | Unknown*/ => {
  if (value instanceof Unknown)
    return value;
  return cast(value);
}

module.exports = {
  getDiff,
  toUnknown,
  createApplyFunction,
}