// Generated by CoffeeScript 1.12.7

/*
 *
 *  class User extends db.Model
 *      tableName: 'users'
 *
 *      @schema [
 *          BelongsToMany Group, query: -> @userland()
 *
 *          Scope 'active', -> @where(active: true)
 *          Scope 'withEmail', -> @where('email is not null')
 *          Scope 'activeWithEmail', -> @active().withEmail()
 *
 *          Scope 'default', -> @where(deleted: false)
 *      ]
 *
 *  User.active().fetchAll()
 *  User.forge(username: 'alice').flagged().fetchAll()
 *  User.unscoped().active().fetchAll()
 *
 *  alice = User.forge(...).fetch()
 *  alice.$groups.named('wheel').fetchOne()
 *  alice.$groups.unscoped().fetch()
 *  alice.$groups.unscoped().count()
 *
 */
var Scope,
  slice = [].slice;

Scope = (function() {
  function Scope(name, builder) {
    if (!(this instanceof Scope)) {
      return new Scope(name, builder);
    }
    this.name = name;
    this.builder = builder;
  }

  Scope.prototype.contributeToSchema = function(schema) {
    return schema.push(this);
  };

  Scope.prototype.contributeToModel = function(cls) {
    var base;
    this.model = cls;
    if (this.name !== 'default') {
      cls.prototype[this.name] = this.createScope();
      return cls[this.name] = this.createStaticScope();
    } else {
      if ((base = this.model).__bookshelf_schema == null) {
        base.__bookshelf_schema = {};
      }
      return this.model.__bookshelf_schema.defaultScope = this;
    }
  };

  Scope.prototype.apply = function(obj, args) {
    if (obj._appliedScopes == null) {
      obj._appliedScopes = [];
    }
    return obj._appliedScopes.push([this.name, this.builder, args]);
  };

  Scope.prototype.liftScope = function(to) {
    var self;
    if (to._liftedScopes == null) {
      to._liftedScopes = [];
    }
    to._liftedScopes.push(this);
    if (this.name === 'default') {
      return this.apply(to);
    } else if (!(this.name in to)) {
      self = this;
      return to[this.name] = function() {
        var args, obj;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        obj = this.cloneWithScopes();
        self.apply(obj, args);
        return obj;
      };
    }
  };

  Scope.prototype.createScope = function() {
    var self;
    self = this;
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      self.apply(this, args);
      return this;
    };
  };

  Scope.prototype.createStaticScope = function() {
    var self;
    self = this;
    return function() {
      var instance;
      instance = this.forge();
      return instance[self.name].apply(instance, arguments);
    };
  };

  return Scope;

})();

module.exports = Scope;
