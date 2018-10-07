// Generated by CoffeeScript 2.3.2
var Bookshelf, CheckIt, EmailField, Fields, IntField, Schema, StringField, init;

Bookshelf = require('bookshelf');

CheckIt = require('checkit');

Schema = require('../src/');

init = require('./init');

Fields = require('../src/fields');

({StringField, IntField, EmailField} = Fields);

describe("Validation", function() {
  var User, db;
  this.timeout(3000);
  db = null;
  User = null;
  before(function() {
    db = init.init();
    return init.users();
  });
  beforeEach(function() {
    return User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([
        StringField('username',
        {
          minLength: 3,
          maxLength: 15
        }),
        EmailField('email')
      ]);

      return User;

    }).call(this);
  });
  it('should create array of validations', function() {
    return User.__bookshelf_schema.validations.should.deep.equal({
      username: ['string', 'minLength:3', 'maxLength:15'],
      email: ['string', 'email']
    });
  });
  it('should validate models', co(function*() {
    return (yield [
      new User({
        username: 'bogus'
      }).validate().should.be.fulfilled,
      new User({
        username: 'bogus',
        email: 'foobar'
      }).validate().should.be.rejected
    ]);
  }));
  it('should run validations on save', co(function*() {
    var user;
    spy.on(User.prototype, 'validate');
    user = new User({
      username: 'alice'
    });
    yield user.save();
    return user.validate.should.have.been.called();
  }));
  it("shouldn't apply validation if plugin initialized with option validation: false", co(function*() {
    var db2, user;
    db2 = Bookshelf(db.knex);
    db2.plugin(Schema({
      validation: false
    }));
    User = (function() {
      class User extends db2.Model {};

      User.prototype.tableName = 'users';

      User.prototype.validations = [
        function() {
          return false;
        }
      ];

      return User;

    }).call(this);
    spy.on(User.prototype, 'validate');
    user = new User({
      username: 'alice'
    });
    yield user.save();
    user.validate.should.not.have.been.called();
    return (yield user.validate().should.be.fulfilled);
  }));
  it("shouldn't apply validation when saved with option validation: false", co(function*() {
    var f, user;
    f = spy(function() {
      return false;
    });
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([
        StringField('username',
        {
          validations: [f]
        })
      ]);

      return User;

    }).call(this);
    user = new User({
      username: 'alice'
    });
    yield user.save(null, {
      validation: false
    });
    return f.should.not.have.been.called();
  }));
  it("when patching should accept validation to passed attributes only", co(function*() {
    var f, g, h, user;
    f = spy(function() {
      return true;
    });
    g = spy(function() {
      return true;
    });
    h = spy(function() {
      return false;
    });
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([
        StringField('username',
        {
          validations: [f]
        }),
        StringField('password',
        {
          validations: [g]
        }),
        StringField('email',
        {
          validations: [h],
          required: true
        })
      ]);

      return User;

    }).call(this);
    user = (yield User.forge({
      username: 'alice'
    }).save(null, {
      validation: false
    }));
    user.email = 'foobar';
    yield user.save({
      username: 'annie',
      password: 'secret'
    }, {
      patch: true
    });
    f.should.have.been.called();
    g.should.have.been.called();
    h.should.not.have.been.called();
    f.reset();
    g.reset();
    try {
      yield user.save({
        username: 'annie',
        password: 'secret'
      }, {
        patch: false
      });
    } catch (error) {

    }
    // pass
    f.should.have.been.called();
    g.should.have.been.called();
    return h.should.have.been.called();
  }));
  it('accepts custom validation rules like Checkit do', co(function*() {
    var e;
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      User.schema([
        StringField('username',
        {
          validations: [
            {
              rule: 'minLength:5',
              message: '{{label}}: foo',
              label: 'foo'
            }
          ]
        })
      ]);

      return User;

    }).call(this);
    e = (yield new User({
      username: 'bar'
    }).validate().should.be.rejected);
    return e.get('username').message.should.equal('foo: foo');
  }));
  return describe('Custom error messages', function() {
    it('uses provided messages', co(function*() {
      var e;
      User = (function() {
        class User extends db.Model {};

        User.prototype.tableName = 'users';

        User.schema([
          StringField('foo',
          {
            min_length: {
              value: 10,
              message: 'foo'
            }
          })
        ]);

        return User;

      }).call(this);
      e = (yield new User({
        foo: 'bar'
      }).validate().should.be.rejected);
      return e.get('foo').message.should.equal('foo');
    }));
    it('uses field default error message and label', co(function*() {
      var e;
      User = (function() {
        class User extends db.Model {};

        User.prototype.tableName = 'users';

        User.schema([
          StringField('username',
          {
            min_length: 10,
            message: '{{label}}: foo',
            label: 'foo'
          })
        ]);

        return User;

      }).call(this);
      e = (yield new User({
        username: 'bar'
      }).validate().should.be.rejected);
      return e.get('username').message.should.equal('foo: foo');
    }));
    it('user field error message and label for field type validation', co(function*() {
      var e;
      User = (function() {
        class User extends db.Model {};

        User.prototype.tableName = 'users';

        User.schema([
          EmailField('email',
          {
            message: '{{label}}: foo',
            label: 'foo'
          })
        ]);

        return User;

      }).call(this);
      e = (yield new User({
        email: 'bar'
      }).validate().should.be.rejected);
      return e.get('email').message.should.equal('foo: foo');
    }));
    return it('can use i18n for messages', co(function*() {
      var db2, e;
      db2 = Bookshelf(db.knex);
      db2.plugin(Schema({
        language: 'ru',
        messages: {
          email: 'Поле {{label}} должно содержать email-адрес'
        }
      }));
      User = (function() {
        class User extends db2.Model {};

        User.prototype.tableName = 'users';

        User.schema([EmailField('email')]);

        return User;

      }).call(this);
      e = (yield new User({
        email: 'bar'
      }).validate().should.be.rejected);
      return e.get('email').message.should.equal('Поле email должно содержать email-адрес');
    }));
  });
});
