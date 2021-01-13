// @flow strict
/*:: import type { Schema, Type } from '@lukekaalim/terraform-service'; */
/*:: import type { SimpleSchemaArgs } from './schema'; */
/*:: import type { SimpleAttributeMap } from './attribute'; */
const { Unknown } = require('@lukekaalim/terraform-service');
const { createSimpleSchema } = require('./schema');
const { mapObjectEntries } = require('./utility');

/*::
export type SimpleResourceArgs<Plan, State, Provider> = {
  name: string,
  simpleSchema: SimpleSchemaArgs,
  configure: SimpleResourceConfigure<Plan, State, Provider>,
};

export type SimpleResourceConfigure<Plan, State, Provider> = (provider: Provider) => {
  create: (plan: Plan) => Promise<State>,
  read: (state: State) => Promise<State | null>,
  update: (state: State, plan: Plan) => Promise<State>,
  destroy: (state: State) => Promise<void>,
};
*/

/*::
type Plan = { [string]: mixed | Unknown };
*/

const createSimplePlan = (
  simpleSchema/*: SimpleSchemaArgs*/,
  state/*: ?{ [string]: mixed }*/,
  config/*: { [string]: mixed }*/
)/*: Plan*/ => {
  const requiredPlan = mapObjectEntries/*:: <SimpleAttributeMap, Plan>*/(
    simpleSchema.required || {},
    ([name]) => [name, config[name]]
  );
  const computedPlan = mapObjectEntries/*:: <SimpleAttributeMap, Plan>*/(
    simpleSchema.computed || {},
    ([name]) => [name, state ? state[name] : new Unknown()]
  );
  return {
    ...requiredPlan,
    ...computedPlan,
  };
};

const createSimpleState = async /*::<Pl, St, Pr>*/(
  configure/*: SimpleResourceConfigure<Pl, St, Pr>*/,
  state/*: St*/,
  plan/*: Pl*/,
  provider/*: Pr*/,
)/*: Promise<?St>*/ => {
  const { create, update, destroy } = configure(provider);
  if (state && plan)
    return await update(state, plan);
  else if (!state && plan)
    return await create(plan);
  else if (state && !plan)
    return await destroy(state);
  else
    throw new Error();
};

const createSimpleResource = /*::<Pl, St, Pr>*/({
  name,
  simpleSchema,
  configure
}/*: SimpleResourceArgs<Pl, St, Pr>*/)/*: Resource*/ => {
  const schema = createSimpleSchema(simpleSchema);
  const plan = async (state, config) => {
    return createSimplePlan(simpleSchema, state, config);
  };
  const apply = async (state, config, provider) => {
    return createSimpleState(configure, state, config, provider);
  };
  const read = async (state, provider) => {
    const { read } = configure(provider);
    return await read(state);
  };

  return createResource({
    name,
    schema,
    plan,
    apply,
    read,
  });
};

/*::
export type Resource = {
  name: string,
  schema: Schema,
  plan: (state: any, config: any, provider: any) => Promise<any>,
  apply: (state: any, config: any, provider: any) => Promise<any>,
  read: (state: any, provider: any) => Promise<any>,
  upgrade: (version: number, oldState: any) => Promise<any>,
  validate: (config: any) => Promise<void>,
};

export type ResourceArgs = {
  ...Resource,
  plan?: $PropertyType<Resource, 'plan'>,
  apply?: $PropertyType<Resource, 'apply'>,
  read?: $PropertyType<Resource, 'read'>,
  upgrade?: $PropertyType<Resource, 'upgrade'>,
  validate?: $PropertyType<Resource, 'validate'>,
};
*/
const createResource = ({
  name,
  schema,
  plan = async (s, c, p) => c,
  apply = async (s, c, p) => c,
  read = async (s, p) => s,
  upgrade = async (v, s) => s,
  validate = async (c) => undefined,
}/*: ResourceArgs*/)/*: Resource*/ => {
  return {
    name,
    schema,
    plan,
    apply,
    read,
    upgrade,
    validate,
  };
};

module.exports = {
  createSimpleResource,
  createSimplePlan,
  createSimpleState,
  createResource,
};
