// Generated by CoffeeScript 2.3.2
var Bookshelf, Fields, MorphOne, MorphTo, Relations, Schema, StringField, init;

Bookshelf = require('bookshelf');

Schema = require('../../lib/');

init = require('../init');

Fields = require('../../lib/fields');

Relations = require('../../lib/relations');

({StringField} = Fields);

({MorphOne, MorphTo} = Relations);

describe("Relations", function() {
  var Tag, User, db, fixtures;
  this.timeout(3000);
  db = null;
  User = null;
  Tag = null;
  fixtures = {
    alice: co(function*() {
      var alice, tag;
      alice = (yield new User({
        username: 'alice'
      }).save());
      tag = (yield new Tag({
        name: 'girl',
        tagable_id: alice.id,
        tagable_type: 'users'
      }).save());
      return [alice, tag];
    })
  };
  before(co(function*() {
    db = init.init();
    return (yield [init.users(), init.tags()]);
  }));
  return describe('MorphTo', function() {
    return describe('plain', function() {
      var ensureAssigned;
      beforeEach(function() {
        User = (function() {
          class User extends db.Model {};

          User.prototype.tableName = 'users';

          return User;

        }).call(this);
        Tag = (function() {
          class Tag extends db.Model {};

          Tag.prototype.tableName = 'tags';

          Tag.schema([StringField('name'), MorphTo('tagable', [User])]);

          return Tag;

        }).call(this);
        return User.schema([StringField('username'), MorphOne(Tag, 'tagable')]);
      });
      afterEach(function() {
        return init.truncate('users', 'tags');
      });
      it('creates accessor', co(function*() {
        var alice, tag;
        [alice, tag] = (yield fixtures.alice());
        tag.tagable.should.be.a('function');
        yield tag.load('tagable');
        tag.$tagable.should.be.an.instanceof(User);
        return tag.$tagable.username.should.equal(alice.username);
      }));
      ensureAssigned = co(function*(newUser, name) {
        var _, tag;
        if (name == null) {
          name = newUser.username;
        }
        [_, tag] = (yield fixtures.alice());
        yield tag.$tagable.assign(newUser);
        tag = (yield Tag.forge({
          id: tag.id
        }).fetch({
          withRelated: 'tagable'
        }));
        return tag.$tagable.username.should.equal(name);
      });
      return it('can assign model', co(function*() {
        var bob;
        bob = (yield new User({
          username: 'bob'
        }).save());
        return (yield ensureAssigned(bob));
      }));
    });
  });
});
