// Generated by CoffeeScript 1.12.7
var Rejected, cast;

Rejected = require('../utils').Rejected;

cast = require('./cast');

module.exports = {
  assign: function(model, relation, obj, options) {
    var e, foreignKey, old;
    if (relation.options.through) {
      return Rejected(new Error("Can't assign relation with interim model"));
    }
    foreignKey = this.relatedData.key('foreignKey');
    try {
      obj = cast.forgeOrFetch(this, obj, options, "Can't assign " + obj + " to " + model + " as a " + relation.name);
      old = model[relation.name]().fetch(options);
      return Promise.all([old, obj]).then(function(arg) {
        var obj, old, pending;
        old = arg[0], obj = arg[1];
        pending = [];
        if (old.id != null) {
          old = old.clone();
          pending.push(old.save(foreignKey, null, options));
        }
        if (obj != null) {
          obj.set(foreignKey, model.id);
          pending.push(obj.save(null, options));
        }
        return Promise.all(pending);
      });
    } catch (error) {
      e = error;
      return Rejected(e);
    }
  }
};
