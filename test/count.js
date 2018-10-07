// Generated by CoffeeScript 2.3.2
var Bookshelf, CheckIt, Schema, init;

Bookshelf = require('bookshelf');

CheckIt = require('checkit');

Schema = require('../lib/');

init = require('./init');

describe("Count", function() {
  var User, db;
  this.timeout(3000);
  db = null;
  User = null;
  before(co(function*() {
    db = init.init();
    yield init.users();
    User = (function() {
      class User extends db.Model {};

      User.prototype.tableName = 'users';

      return User;

    }).call(this);
    return (yield [
      new User({
        username: 'alice',
        flag: true,
        email: 'alice@bookstore'
      }).save(),
      new User({
        username: 'bob',
        flag: true,
        email: 'bob@bookstore'
      }).save(),
      new User({
        username: 'alan',
        flag: false
      }).save()
    ]);
  }));
  it('counts the number of models in a collection', function() {
    return User.collection().count().should.become(3);
  });
  it('optionally counts by column (excluding null values)', function() {
    return User.collection().count('email').should.become(2);
  });
  return it('counts a filtered query', function() {
    return User.collection().query('where', 'flag', '=', true).count().should.become(2);
  });
});