const createResource = ({
  name,
  version = 1,
  schema,
  read = (provider, state) => state,
  plan = (provider, config, oldState, proposedState) => proposedState,
  apply = (provider, config, oldState, plannedState) => ({ newState: plannedState, requiresReplace: [] }),
  validate = (provider, plannedState) => null,
  upgrade = (provider, version, state) => state,
  // import is a reserved word in javascript
  import: import2 = (provider, id) => [],
}) => ({
  name,
  version,
  schema,
  read,
  plan,
  apply,
  validate,
  upgrade,
  import: import2,
});

module.exports = {
  createResource,
};
