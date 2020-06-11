const createResource = (name, version, schemaBlock, methods = {}) => {
  const {
    read = (state) => state,
    plan = (oldState, plannedState) => plannedState,
    apply = (oldState, plannedState) => ({ newState: plannedState, requiresReplace: [] }),
    validate = (plannedState) => null,
    upgrade = (version, plannedState) => plannedState,
    // import is a reserved word in javascript
    import: import2 = (id) => [],
  } = methods;

  return {
    name,
    version,
    schemaBlock,
    read,
    plan,
    apply,
    validate,
    upgrade,
    import: import2,
  };
};

module.exports = {
  createResource,
};
