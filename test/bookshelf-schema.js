// Generated by CoffeeScript 2.3.2
var BelongsTo, Bookshelf, EmailField, Fields, HasMany, IntField, Relations, Schema, StringField, init;

Bookshelf = require('bookshelf');

Schema = require('../lib/');

init = require('./init');

Fields = require('../lib/fields');

Relations = require('../lib/relations');

({StringField, IntField, EmailField} = Fields);

({HasMany, BelongsTo} = Relations);

describe("Bookshelf schema", function() {
  var db;
  this.timeout(3000);
  db = null;
  before(function() {
    return db = init.init();
  });
  it('can apply schema with Model.extend', function() {
    var User;
    User = db.Model.extend({
      tableName: 'users'
    }, {
      schema: [StringField('username'), IntField('age'), EmailField('email')]
    });
    User.__bookshelf_schema.should.be.defined;
    User.prototype.hasOwnProperty('username').should.be.true;
    User.prototype.hasOwnProperty('age').should.be.true;
    return User.prototype.hasOwnProperty('email').should.be.true;
  });
  it('can extend from an extended model', function() {
    var BaseModel, User, user;
    BaseModel = db.Model.extend({
      constructor: function() {
        db.Model.apply(this, arguments);
        return this.base_property = true;
      }
    }, {
      schema: [StringField('commonid')]
    });
    User = BaseModel.extend({
      tableName: 'users'
    }, {
      schema: [StringField('username'), IntField('age'), EmailField('email')]
    });
    User.__bookshelf_schema.should.be.defined;
    User.prototype.hasOwnProperty('username').should.be.true;
    user = new User;
    return user.base_property.should.be.true;
  });
  it('can apply schema with coffeescript @schema static method', function() {
    var User;
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([StringField('username'), IntField('age'), EmailField('email')]);

      return User;

    }).call(this);
    User.__bookshelf_schema.should.be.defined;
    User.prototype.hasOwnProperty('username').should.be.true;
    User.prototype.hasOwnProperty('age').should.be.true;
    return User.prototype.hasOwnProperty('email').should.be.true;
  });
  it("doesn't add property if field has option createProperty: false", function() {
    var User;
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([
        StringField('username',
        {
          createProperty: false
        })
      ]);

      return User;

    }).call(this);
    return User.prototype.hasOwnProperty('username').should.be.false;
  });
  it("doesn't add properties if initialized with option createProperties: false", function() {
    var User, db2;
    db2 = Bookshelf(db.knex);
    db2.plugin(Schema({
      createProperties: false
    }));
    User = (function() {
      class User extends db2.Model {};

      User.prototype.tableName = 'users';

      User.schema([StringField('username')]);

      return User;

    }).call(this);
    return User.prototype.hasOwnProperty('username').should.be.false;
  });
  it("doesn't overwrite existing methods and properties", function() {
    var User;
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([StringField('query')]);

      return User;

    }).call(this);
    return new User().query.should.be.a('function');
  });
  it('field named "id" doesnt overwrite internal id property', function() {
    var User;
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([StringField('id')]);

      return User;

    }).call(this);
    return new User({
      id: 1
    }).id.should.equal(1);
  });
  return it('creates accessors for relations', function() {
    var Photo, User;
    Photo = class Photo extends db.Model {};
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([HasMany(Photo)]);

      return User;

    }).call(this);
    Photo.schema([BelongsTo(User)]);
    User.prototype.hasOwnProperty('$photos').should.be.true;
    return User.prototype.photos.should.be.a.function;
  });
});
