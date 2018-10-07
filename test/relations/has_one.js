// Generated by CoffeeScript 2.3.2
var Bookshelf, EmailField, Fields, HasOne, IntField, Relations, Schema, StringField, init;

Bookshelf = require('bookshelf');

Schema = require('../../lib/');

init = require('../init');

Fields = require('../../lib/fields');

Relations = require('../../lib/relations');

({StringField, IntField, EmailField} = Fields);

({HasOne} = Relations);

describe("Relations", function() {
  var Inviter, Profile, User, db, fixtures;
  this.timeout(3000);
  db = null;
  User = null;
  Profile = null;
  Inviter = null;
  fixtures = {
    alice: co(function*() {
      var alice, profile;
      alice = (yield new User({
        username: 'alice'
      }).save());
      profile = (yield new Profile({
        greetings: 'Hola!',
        user_id: alice.id
      }).save());
      return [alice, profile];
    }),
    aliceAndBob: co(function*() {
      var alice, bob, inviter;
      [alice, bob] = (yield [
        new User({
          username: 'alice'
        }).save(),
        new User({
          username: 'bob'
        }).save()
      ]);
      inviter = (yield new Inviter({
        greeting: 'Hello Bob!',
        user_id: alice.id
      }).save());
      yield bob.save({
        inviter_id: inviter.id
      });
      return [alice, bob, inviter];
    })
  };
  before(co(function*() {
    db = init.init();
    return (yield [init.users(), init.profiles()]);
  }));
  return describe('HasOne', function() {
    describe('plain', function() {
      beforeEach(function() {
        Profile = (function() {
          class Profile extends db.Model {};

          Profile.prototype.tableName = 'profiles';

          Profile.schema([StringField('greetings'), IntField('user_id')]);

          return Profile;

        }).call(this);
        return User = (function() {
          class User extends db.Model {};

          User.prototype.tableName = 'users';

          User.schema([StringField('username'), HasOne(Profile)]);

          return User;

        }).call(this);
      });
      afterEach(function() {
        return init.truncate('users', 'profiles');
      });
      it('creates accessor', co(function*() {
        var _, alice;
        [alice, _] = (yield fixtures.alice());
        alice.profile.should.be.a('function');
        yield alice.load('profile');
        alice.$profile.should.be.an.instanceof(db.Model);
        return alice.$profile.user_id.should.equal(alice.id);
      }));
      it('can assign model', co(function*() {
        var alice, profile, profile2;
        [alice, profile] = (yield fixtures.alice());
        profile2 = (yield new Profile({
          greetings: 'Hi!'
        }).save());
        yield alice.$profile.assign(profile2);
        profile = (yield Profile.forge({
          id: profile.id
        }).fetch());
        alice = (yield User.forge({
          id: alice.id
        }).fetch({
          withRelated: 'profile'
        }));
        expect(profile.user_id).to.be.null;
        return alice.$profile.id.should.equal(profile2.id);
      }));
      it('can assign plain object', co(function*() {
        var alice, profile;
        [alice, profile] = (yield fixtures.alice());
        yield alice.$profile.assign({
          greetings: 'Hi!'
        });
        [alice, profile] = (yield [
          User.forge({
            id: alice.id
          }).fetch({
            withRelated: 'profile'
          }),
          Profile.forge({
            id: profile.id
          }).fetch()
        ]);
        alice.$profile.greetings.should.equal('Hi!');
        return expect(profile.user_id).to.be.null;
      }));
      return it('can assign by id', co(function*() {
        var alice, profile, profile2;
        [alice, profile] = (yield fixtures.alice());
        profile2 = (yield new Profile({
          greetings: 'Hi!'
        }).save());
        yield alice.$profile.assign(profile2.id);
        profile = (yield Profile.forge({
          id: profile.id
        }).fetch());
        alice = (yield User.forge({
          id: alice.id
        }).fetch({
          withRelated: 'profile'
        }));
        expect(profile.user_id).to.be.null;
        return alice.$profile.id.should.equal(profile2.id);
      }));
    });
    describe('through', function() {
      before(function() {
        return init.inviters();
      });
      beforeEach(function() {
        Inviter = (function() {
          class Inviter extends db.Model {};

          Inviter.prototype.tableName = 'inviters';

          return Inviter;

        }).call(this);
        User = (function() {
          class User extends db.Model {};

          User.prototype.tableName = 'users';

          User.schema([
            StringField('username'),
            HasOne(User,
            {
              name: 'invited',
              through: Inviter
            })
          ]);

          return User;

        }).call(this);
        return Inviter.schema([StringField('greeting')]);
      });
      afterEach(function() {
        return init.truncate('users', 'inviters');
      });
      return it('can access related model', co(function*() {
        var alice, bob, inviter;
        [alice, bob, inviter] = (yield fixtures.aliceAndBob());
        yield alice.load('invited');
        alice.$invited.should.be.an.instanceof(User);
        return alice.$invited.id.should.equal(bob.id);
      }));
    });
    return describe('onDestroy', function() {
      beforeEach(function() {
        Profile = (function() {
          class Profile extends db.Model {};

          Profile.prototype.tableName = 'profiles';

          Profile.schema([StringField('greetings'), IntField('user_id')]);

          return Profile;

        }).call(this);
        return User = (function() {
          class User extends db.Model {};

          User.prototype.tableName = 'users';

          return User;

        }).call(this);
      });
      afterEach(function() {
        return init.truncate('users', 'profiles');
      });
      it('can cascade-destroy dependent models', co(function*() {
        var alice, profile, profile2;
        User.schema([
          HasOne(Profile,
          {
            onDestroy: 'cascade'
          })
        ]);
        [alice, profile] = (yield fixtures.alice());
        profile2 = (yield new Profile({
          greetings: 'Hi!'
        }).save());
        yield alice.destroy().should.be.fulfilled;
        [profile, profile2] = (yield [
          new Profile({
            id: profile.id
          }).fetch(),
          new Profile({
            id: profile2.id
          }).fetch()
        ]);
        expect(profile).to.be.null;
        return expect(profile2).not.to.be.null;
      }));
      it('can reject destroy when there id dependent model', co(function*() {
        var _, alice;
        User.schema([
          HasOne(Profile,
          {
            onDestroy: 'reject'
          })
        ]);
        [alice, _] = (yield fixtures.alice());
        yield alice.destroy().should.be.rejected;
        yield alice.$profile.assign(null);
        return alice.destroy().should.be.fulfilled;
      }));
      return it('can detach dependent models on destroy', co(function*() {
        var alice, profile;
        User.schema([
          HasOne(Profile,
          {
            onDestroy: 'detach'
          })
        ]);
        [alice, profile] = (yield fixtures.alice());
        yield alice.destroy().should.be.fulfilled;
        profile = (yield new Profile({
          id: profile.id
        }).fetch());
        return expect(profile.user_id).to.be.null;
      }));
    });
  });
});