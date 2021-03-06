/*
 *
 *  User = db.Model.extend({
 *      tableName: 'users'
 *  }, {
 *      schema: [
 *          StringField 'username'
 *          IntField 'age'
 *          EmailField 'email'
 *
 *          HasMany 'photos', Photo, onDestroy: 'cascade'
 *      ]
 *  });
 *
 *  class User extends db.Model.extend
 *      tableName: 'users'
 *      @schema [
 *          StringField 'username'
 *          IntField 'age'
 *          EmailField 'email'
 *
 *          HasMany 'photos', Photo, onDestroy: 'cascade'
 *      ]
 *
 */
var CheckIt, plugin, semverCmp, utils,
  hasProp = {}.hasOwnProperty,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  slice = [].slice;

CheckIt = require('checkit');

semverCmp = require('semver-compare');

utils = require('./utils');

plugin = function(options) {
  if (options == null) {
    options = {};
  }
  return function(db) {
    var Collection, Model, applyAliases, buildSchema, contributeToModel, fixInheritance, needFixInheritance;
    if (options.createProperties == null) {
      options.createProperties = true;
    }
    if (options.validation == null) {
      options.validation = true;
    }
    needFixInheritance = semverCmp(db.VERSION, '0.10') < 0;
    fixInheritance = needFixInheritance ? function(base, cls) {
      var k, proto, results, v;
      proto = base.__proto__;
      results = [];
      while (typeof proto === 'function') {
        for (k in proto) {
          if (!hasProp.call(proto, k)) continue;
          v = proto[k];
          if (!cls.hasOwnProperty(k)) {
            cls[k] = v;
          }
        }
        results.push(proto = proto.__proto__);
      }
      return results;
    } : function() {};
    buildSchema = function(entities) {
      var e, i, len, schema;
      schema = [];
      for (i = 0, len = entities.length; i < len; i++) {
        e = entities[i];
        if (typeof e.contributeToSchema === "function") {
          e.contributeToSchema(schema);
        }
      }
      return schema;
    };
    contributeToModel = function(cls, entities) {
      var e, i, len;
      for (i = 0, len = entities.length; i < len; i++) {
        e = entities[i];
        e.contributeToModel(cls);
      }
      return void 0;
    };
    applyAliases = function(aliases, attrs) {
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
    Model = (function(superClass) {
      var fn, fn1, i, j, len, len1, method, ref, ref1;

      extend(Model, superClass);

      Model.db = db;

      Model.transaction = db.transaction.bind(db);

      Model.__bookshelf_schema_options = options;

      Model.schema = function(schema) {
        this.__schema = buildSchema(schema);
        return contributeToModel(this, this.__schema);
      };

      Model.extend = function(props, statics) {
        var ActualModel, cls, ctor, k, ref, schema, v;
        if (statics != null ? statics.schema : void 0) {
          schema = statics.schema;
          delete statics.schema;
        }
        if (needFixInheritance) {
          ctor = props.hasOwnProperty('constructor') ? props.constructor : (ActualModel = this, function() {
            return ActualModel.apply(this, arguments);
          });
          ref = this;
          for (k in ref) {
            if (!hasProp.call(ref, k)) continue;
            v = ref[k];
            ctor[k] = v;
          }
          props.constructor = ctor;
        }
        cls = Model.__super__.constructor.extend.call(this, props, statics);
        if (!schema) {
          return cls;
        }
        cls.schema(schema);
        return cls;
      };

      function Model(attributes, options) {
        var aliases, base1;
        if ((base1 = this.constructor).__schema == null) {
          base1.__schema = [];
        }
        if (!attributes) {
          return Model.__super__.constructor.apply(this, arguments);
        }
        aliases = this._aliases();
        if (aliases) {
          attributes = applyAliases(aliases, attributes);
        }
        Model.__super__.constructor.call(this, attributes, options);
      }

      Model.prototype.initialize = function() {
        Model.__super__.initialize.apply(this, arguments);
        return this.initSchema();
      };

      Model.prototype.initSchema = function() {
        var e, i, j, len, len1, ref, ref1, ref2;
        ref = this.constructor.__schema;
        for (i = 0, len = ref.length; i < len; i++) {
          e = ref[i];
          if (typeof e.initialize === "function") {
            e.initialize(this);
          }
        }
        if (this.constructor.__bookshelf_schema_options.validation) {
          this.on('saving', this.validate, this);
        }
        ref1 = this.constructor.__schema;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          e = ref1[j];
          if (!(e.onDestroy != null)) {
            continue;
          }
          this.on('destroying', this._handleDestroy, this);
          break;
        }
        if ((ref2 = this.constructor.__bookshelf_schema) != null ? ref2.defaultScope : void 0) {
          this.constructor.__bookshelf_schema.defaultScope.apply(this);
        }
        return void 0;
      };

      Model.prototype.format = function(attrs, options) {
        var f, i, len, ref;
        attrs = Model.__super__.format.call(this, attrs, options);
        if (this.constructor.__bookshelf_schema) {
          ref = this.constructor.__bookshelf_schema.formatters;
          for (i = 0, len = ref.length; i < len; i++) {
            f = ref[i];
            f(attrs, options);
          }
        }
        return attrs;
      };

      Model.prototype.parse = function(resp, options) {
        var attrs, f, i, len, ref, ref1;
        attrs = Model.__super__.parse.call(this, resp, options);
        if ((ref = this.constructor.__bookshelf_schema) != null ? ref.parsers : void 0) {
          ref1 = this.constructor.__bookshelf_schema.parsers;
          for (i = 0, len = ref1.length; i < len; i++) {
            f = ref1[i];
            f(attrs, options);
          }
        }
        return attrs;
      };

      Model.prototype.toJSON = function(options) {
        var aliases, json, use_columns;
        if (options == null) {
          options = {};
        }
        json = Model.__super__.toJSON.apply(this, arguments);
        use_columns = !options || options.virtuals === false || options.use_columns;
        aliases = this._aliases();
        if (!use_columns && aliases) {
          json = applyAliases(utils.invert(aliases), json);
        }
        return json;
      };

      Model.prototype.validate = function(self, attrs, options) {
        var checkit, json, modelValidations, ref, ref1, validations;
        if (options == null) {
          options = {};
        }
        if (!this.constructor.__bookshelf_schema_options.validation || options.validation === false) {
          return utils.Fulfilled();
        }
        json = options.patch ? attrs : this.toJSON({
          validating: true,
          visibility: false
        });
        validations = !((ref = this.constructor.__bookshelf_schema) != null ? ref.validations : void 0) ? [] : options.patch ? utils.pluck.apply(utils, [this.constructor.__bookshelf_schema.validations].concat(slice.call(Object.keys(json)))) : this.constructor.__bookshelf_schema.validations;
        modelValidations = !options.patch && ((ref1 = this.constructor.__bookshelf_schema) != null ? ref1.modelValidations : void 0);
        options = this._checkitOptions.call(this);
        checkit = CheckIt(validations, options).run(json);
        if (this.modelValidations && this.modelValidations.length > 0) {
          checkit = checkit.then(function() {
            return CheckIt({
              all: model_validations
            }, options).run({
              all: json
            });
          });
        }
        return checkit;
      };

      Model.prototype.save = function(key, value, options) {
        var attrs, obj;
        if (!this._aliases()) {
          return Model.__super__.save.apply(this, arguments);
        }
        if ((key == null) || typeof key === 'object') {
          attrs = key != null ? utils.clone(key) : {};
          options = utils.clone(value) || {};
        } else {
          attrs = (
            obj = {},
            obj["" + key] = value,
            obj
          );
          options = utils.clone(options) || {};
        }
        attrs = applyAliases(this._aliases(), attrs);
        return Model.__super__.save.call(this, attrs, options);
      };

      Model.prototype.destroy = function(options) {
        return utils.forceTransaction(Model.transaction, options, (function(_this) {
          return function(options) {
            return Model.__super__.destroy.call(_this, options);
          };
        })(this));
      };

      ref = ['all', 'fetch'];
      fn = function(method) {
        var name1;
        return Model.prototype[name1 = method] = function() {
          this._applyScopes();
          return Model.__super__[name1].apply(this, arguments);
        };
      };
      for (i = 0, len = ref.length; i < len; i++) {
        method = ref[i];
        fn(method);
      }

      ref1 = ['hasMany', 'hasOne', 'belongsToMany', 'morphOne', 'morphMany', 'belongsTo', 'through'];
      fn1 = function(method) {
        var name1;
        return Model.prototype[name1 = method] = function() {
          var related;
          related = Model.__super__[name1].apply(this, arguments);
          this._liftRelatedScopes(related);
          related.unscoped = function() {
            return this.clone();
          };
          return related;
        };
      };
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        method = ref1[j];
        fn1(method);
      }

      Model.prototype.unscoped = function() {
        this._appliedScopes = [];
        return this;
      };

      Model.unscoped = function() {
        return this.forge().unscoped();
      };

      Model.prototype._checkitOptions = function() {
        var k, l, len2, memo, ref2;
        memo = {};
        ref2 = ['language', 'labels', 'messages'];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          k = ref2[l];
          if (this.constructor.__bookshelf_schema_options[k]) {
            memo[k] = this.constructor.__bookshelf_schema_options[k];
          }
        }
        return memo;
      };

      Model.prototype._aliases = function() {
        var ref2;
        return (ref2 = this.constructor.__bookshelf_schema) != null ? ref2.aliases : void 0;
      };

      Model.prototype._handleDestroy = function(model, options) {
        var e, handled, obj;
        if (options == null) {
          options = {};
        }
        options = utils.clone(options, {
          except: ['query']
        });
        options.destroyingCache = (
          obj = {},
          obj[model.tableName + ":" + model.id] = utils.Fulfilled(),
          obj
        );
        handled = (function() {
          var l, len2, ref2, results;
          ref2 = this.constructor.__schema;
          results = [];
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            e = ref2[l];
            results.push(typeof e.onDestroy === "function" ? e.onDestroy(model, options) : void 0);
          }
          return results;
        }).call(this);
        return Promise.all(handled).then(function() {
          return Promise.all(utils.values(options.destroyingCache));
        }).then(function() {
          return delete options.destroyingCache;
        });
      };

      Model.prototype._applyScopes = function() {
        var args, l, len2, name, ref2, ref3, scope;
        if (this._appliedScopes) {
          ref2 = this._appliedScopes;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            ref3 = ref2[l], name = ref3[0], scope = ref3[1], args = ref3[2];
            this.query(function(qb) {
              return scope.apply(qb, args);
            });
          }
          return delete this._appliedScopes;
        }
      };

      Model.prototype._liftRelatedScopes = function(to) {
        var e, l, len2, ref2, results, target;
        target = to.model || to.relatedData.target;
        if (target && (target.__schema != null)) {
          ref2 = target.__schema;
          results = [];
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            e = ref2[l];
            if (e.liftScope != null) {
              results.push(e.liftScope(to));
            }
          }
          return results;
        }
      };

      return Model;

    })(db.Model);
    fixInheritance(db.Model, Model);
    Collection = (function(superClass) {
      var fn, i, len, method, ref;

      extend(Collection, superClass);

      function Collection() {
        return Collection.__super__.constructor.apply(this, arguments);
      }

      ref = ['fetch', 'fetchOne'];
      fn = function(method) {
        var name1;
        return Collection.prototype[name1 = method] = function() {
          this._applyScopes();
          return Collection.__super__[name1].apply(this, arguments);
        };
      };
      for (i = 0, len = ref.length; i < len; i++) {
        method = ref[i];
        fn(method);
      }

      Collection.prototype.count = function(column, options) {
        var query, relatedData, sync;
        if (column == null) {
          column = '*';
        }
        if (typeof this._applyScopes === "function") {
          this._applyScopes();
        }
        sync = this.sync(options);
        query = sync.query.clone();
        this._knex = sync.query;
        relatedData = sync.syncing.relatedData;
        if (relatedData) {
          if (relatedData.isJoined()) {
            relatedData.joinClauses(query);
          }
          relatedData.whereClauses(query);
        }
        return query.count(column).then(function(result) {
          return Number(utils.values(result[0])[0]);
        });
      };

      Collection.prototype.cloneWithScopes = function() {
        var j, len1, ref1, result, scope;
        result = this.clone();
        if (this._liftedScopes) {
          ref1 = this._liftedScopes;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            scope = ref1[j];
            scope.liftScope(result);
          }
        }
        if (this._appliedScopes) {
          result._appliedScopes = this._appliedScopes.slice(0);
        }
        return result;
      };

      Collection.prototype._applyScopes = Model.prototype._applyScopes;

      return Collection;

    })(db.Collection);
    fixInheritance(db.Collection, Collection);
    db.Model = Model;
    return db.Collection = Collection;
  };
};

module.exports = plugin;
