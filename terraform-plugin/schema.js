// @flow strict
/*:: import type { Provider, Attribute, Resource, RichText } from './main'; */
/*:: import type { Schema, Attribute as SchemaAttribute, Diagnostic } from '@lukekaalim/terraform-service'; */

const createDescriptionProperties = (richText/*: ?RichText*/)/*: {| description: string, descriptionKind: 0 | 1 |}*/ => {
  if (!richText)
    return {
      description: '',
      descriptionKind: 0,
    }
  switch (richText.type) {
    case 'plain':
      return {
        description: richText.content,
        descriptionKind: 0,
      };
    case 'markdown':
      return {
        description: richText.content,
        descriptionKind: 1,
      };
  }
};

const attributeToSchemaAttribute = (attribute/*: Attribute*/)/*: SchemaAttribute*/ => ({
  name: attribute.name,
  type: Buffer.from(JSON.stringify(attribute.type)),
  required: attribute.required || false,
  optional: attribute.optional || false,
  computed: attribute.computed || false,
  sensitive: attribute.sensitive || false,
  deprecated: attribute.deprecated || false,
  ...createDescriptionProperties(attribute.description),
});

const resourceToSchema = (resource/*: Resource<any>*/)/*: Schema*/ => {
  return {
    version: 0,
    block: {
      version: 0,
      attributes: resource.attributes.map(attributeToSchemaAttribute),
      blockTypes: [],
      deprecated: false,
      ...createDescriptionProperties(resource.description),
    }
  };
};

const providerToSchema = (provider/*: Provider<any>*/)/*: Schema*/ => {
  return {
    version: 0,
    block: {
      version: 0,
      attributes: provider.attributes.map(attributeToSchemaAttribute),
      blockTypes: [],
      deprecated: false,
      ...createDescriptionProperties(provider.description),
    }
  }
};

const createErrorDiagnostic = (error/*: Error*/)/*: Diagnostic*/ => {
  return {
    severity: 1,
    summary: error.message,
    detail: error.stack,
    attribute: { steps: [] },
  }
};

module.exports = {
  createErrorDiagnostic,
  providerToSchema,
  resourceToSchema,
  createDescriptionProperties,
}