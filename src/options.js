// Generated by CoffeeScript 1.12.7

/*
 *
 *  Options validation: false
 *
 */
var Options, clone;

clone = require('./utils').clone;

Options = (function() {
  function Options(options) {
    if (!(this instanceof Options)) {
      return new Options(options);
    }
    this.options = options;
  }

  Options.prototype.contributeToSchema = function(schema) {
    return schema.unshift(this);
  };

  Options.prototype.contributeToModel = function(cls) {
    var k, ref, v;
    cls.__bookshelf_schema_options = clone(cls.__bookshelf_schema_options);
    ref = this.options;
    for (k in ref) {
      v = ref[k];
      cls.__bookshelf_schema_options[k] = v;
    }
    return void 0;
  };

  return Options;

})();

module.exports = Options;
