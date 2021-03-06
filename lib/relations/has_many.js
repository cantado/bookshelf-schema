// Generated by CoffeeScript 1.12.7
var Fulfilled, Rejected, cast, forceTransaction, ref;

ref = require('../utils'), Rejected = ref.Rejected, Fulfilled = ref.Fulfilled, forceTransaction = ref.forceTransaction;

cast = require('./cast');

module.exports = {
  assign: function(model, relation, list, options) {
    if (relation.options.through) {
      return Rejected(new Error("Can't assign relation with interim model"));
    }
    if (list == null) {
      list = [];
    }
    if (!(list instanceof Array)) {
      list = [list];
    }
    return forceTransaction(relation.model.transaction, options, (function(_this) {
      return function(options) {
        var attachObjs, currentObjs, e, obj, p;
        try {
          currentObjs = model[relation.name]().fetch(options);
          attachObjs = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = list.length; i < len; i++) {
              obj = list[i];
              p = cast.forgeOrFetch(this, obj, options, "Can't assign " + obj + " to " + model + " as a " + relation.name);
              if (!p) {
                continue;
              }
              results.push(p);
            }
            return results;
          }).call(_this);
          attachObjs = Promise.all(attachObjs);
          return Promise.all([currentObjs, attachObjs]).then(function(arg) {
            var attachObjs, currentObjs, detachObjs, idx, k;
            currentObjs = arg[0], attachObjs = arg[1];
            currentObjs = currentObjs.models;
            idx = currentObjs.reduce(function(memo, obj) {
              memo[obj.id] = obj;
              return memo;
            }, {});
            attachObjs = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = attachObjs.length; i < len; i++) {
                obj = attachObjs[i];
                if ((obj.id != null) && idx[obj.id]) {
                  delete idx[obj.id];
                  continue;
                } else {
                  results.push(obj);
                }
              }
              return results;
            })();
            detachObjs = (function() {
              var results;
              results = [];
              for (k in idx) {
                obj = idx[k];
                results.push(obj);
              }
              return results;
            })();
            return _this.detach(detachObjs, options).then(function() {
              return _this.attach(attachObjs, options);
            });
          });
        } catch (error) {
          e = error;
          return Rejected(e);
        }
      };
    })(this));
  },
  attach: function(model, relation, list, options) {
    if (list == null) {
      return;
    }
    if (!(list instanceof Array)) {
      list = [list];
    }
    return forceTransaction(relation.model.transaction, options, (function(_this) {
      return function(options) {
        var createNew, created, e, i, len, loadUnloaded, models, obj, unloaded;
        try {
          unloaded = [];
          created = [];
          models = [];
          for (i = 0, len = list.length; i < len; i++) {
            obj = list[i];
            switch (false) {
              case typeof obj !== 'number':
                unloaded.push(obj);
                break;
              case obj.constructor !== Object:
                created.push(_this.model.forge(obj));
                break;
              case !(obj instanceof _this.model):
                models.push(obj);
                break;
              default:
                throw new Error("Can't attach " + obj + " to " + model + " as a " + relation.name);
            }
          }
          loadUnloaded = unloaded.length === 0 ? Fulfilled(_this.model.collection()) : _this.model.collection().query('where', _this.idAttribute(), 'in', unloaded).fetch(options);
          createNew = created.length === 0 ? Fulfilled([]) : Promise.all(created.map(function(obj) {
            return obj.save(null, options);
          }));
          return Promise.all([loadUnloaded, createNew]).then(function(arg) {
            var createNew, unloaded;
            unloaded = arg[0], createNew = arg[1];
            list = models.concat(unloaded.models, createNew);
            return model.triggerThen('attaching', model, relation, list, options).then(function() {
              var pending;
              pending = (function() {
                var j, len1, results;
                results = [];
                for (j = 0, len1 = list.length; j < len1; j++) {
                  obj = list[j];
                  results.push(this._attachOne(obj, options));
                }
                return results;
              }).call(_this);
              return Promise.all(pending);
            }).then(function(result) {
              return model.triggerThen('attached', model, relation, result, options);
            });
          });
        } catch (error) {
          e = error;
          return Rejected(e);
        }
      };
    })(this));
  },
  _attachOne: function(model, relation, obj, options) {
    return obj.set(this.relatedData.key('foreignKey'), model.id).save(null, options);
  },
  detach: function(model, relation, list, options) {
    if (list == null) {
      return;
    }
    if (!(list instanceof Array)) {
      list = [list];
    }
    return forceTransaction(relation.model.transaction, options, (function(_this) {
      return function(options) {
        var e, i, len, loadUnloaded, models, obj, unloaded;
        try {
          unloaded = [];
          models = [];
          for (i = 0, len = list.length; i < len; i++) {
            obj = list[i];
            switch (false) {
              case typeof obj !== 'number':
                unloaded.push(obj);
                break;
              case !(obj instanceof _this.model):
                models.push(obj);
                break;
              default:
                throw new Error("Can't detach " + obj + " from " + model + " " + relation.name);
            }
          }
          loadUnloaded = unloaded.length === 0 ? Fulfilled(_this.model.collection()) : _this.model.collection().where(_this.model.idAttribute, 'in', unloaded).fetch(options);
          return loadUnloaded.then(function(unloaded) {
            list = unloaded.models.concat(models);
            return model.triggerThen('detaching', model, relation, list, options).then(function() {
              var pending;
              pending = (function() {
                var j, len1, results;
                results = [];
                for (j = 0, len1 = list.length; j < len1; j++) {
                  obj = list[j];
                  results.push(this._detachOne(obj, options));
                }
                return results;
              }).call(_this);
              return Promise.all(pending);
            }).then(function(result) {
              return model.triggerThen('detached', model, relation, result, options);
            });
          });
        } catch (error) {
          e = error;
          return Rejected(e);
        }
      };
    })(this));
  },
  _detachOne: function(model, relation, obj, options) {
    return obj.set(this.relatedData.key('foreignKey'), null).save(null, options);
  }
};
