import CheckIt from 'checkit'
import semverCmp from 'semver-compare'

import utils from './utils'

const plugin = (pluginOptions = {}) => db => {
  if (pluginOptions.createProperties !== false) {
    pluginOptions.createProperties = true;
  }
  if (pluginOptions.validation !== false) {
    pluginOptions.validation = true;
  }

  const buildSchema = entities => {
    const schema = []
    entities.forEach(entity => {
      if (typeof entity.contributeToSchema === 'function') {
        entity.contributeToSchema(schema)
      }
    })
    return schema
  }

  const contributeToModel = (cls, entities) => {
    entities.forEach(entity => {
      entity.contributeToModel(cls)
    })
  }

  const applyAliases = (aliases, attrs) => {
    var column, name;
    attrs = utils.clone(attrs);
    for (name in aliases) {
      column = aliases[name];
      if (attrs[name] && !attrs[column]) {
        attrs[column] = attrs[name];
        delete attrs[name];
      }
    }
    return attrs;
  };
}
