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
  configure: (provider: Provider) => {
    create: (plan: Plan) => Promise<State>,
    read: (state: State) => Promise<State>,
    update: (state: State, plan: Plan) => Promise<State>,
    destroy: (state: State) => Promise<void>,
  },
};
*/

/*::
type Plan = { [string]: mixed | Unknown };
*/

const createSimpleResource = /*::<Pl, St, Pr>*/({
  name,
  simpleSchema,
  configure
}/*: SimpleResourceArgs<Pl, St, Pr>*/)/*: Resource*/ => {
  const schema = createSimpleSchema(simpleSchema);
  const plan = async (state, config) => {
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
  const apply = async (state, config, provider) => {
    const { create, update, destroy } = configure(provider);
    if (state && config)
      return await update(state, config);
    else if (!state && config)
      return await create(config);
    else if (state && !config)
      return await destroy(state);
    else
      throw new Error();
  };
  const read = async (state, provider) => {
    const { read } = configure(provider);
    return await read(state);
  };

  return {
    name,
    schema,
    plan,
    apply,
    read,
  }
};

/*::
export type Resource = {
  name: string,
  schema: Schema,
  plan: (state: any, config: any, provider: any) => Promise<any>,
  apply: (state: any, config: any, provider: any) => Promise<any>,
  read: (state: any, provider: any) => Promise<any>,
};

export type ResourceArgs = {
  ...Resource,
  plan?: $PropertyType<Resource, 'plan'>,
  apply?: $PropertyType<Resource, 'apply'>,
  read?: $PropertyType<Resource, 'read'>,
};
*/
const createResource = ({
  name,
  schema,
  plan = async (s, c, p) => c,
  apply = async (s, c, p) => c,
  read = async (s, p) => s,
}/*: ResourceArgs*/)/*: Resource*/ => {
  return {
    name,
    schema,
    plan,
    apply,
    read,
  };
};

module.exports = {
  createSimpleResource,
  createResource,
};
