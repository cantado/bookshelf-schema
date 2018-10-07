// Generated by CoffeeScript 2.3.2
var Bookshelf, Knex, Schema, db, groups, init, initDb, inviters, photos, profiles, tags, truncate, users;

Knex = require('knex');

Bookshelf = require('bookshelf');

Schema = require('../lib/');

db = null;

initDb = function() {
  var db_variant, knex;
  db_variant = process.env.BOOKSHELF_SCHEMA_TESTS_DB_VARIANT;
  if (db_variant == null) {
    db_variant = 'sqlite';
  }
  knex = (function() {
    switch (db_variant) {
      case 'sqlite':
        return Knex({
          client: 'sqlite',
          debug: process.env.BOOKSHELF_SCHEMA_TESTS_DEBUG != null,
          connection: {
            filename: ':memory:'
          },
          useNullAsDefault: true
        });
      case 'pg':
      case 'postgres':
        return Knex({
          client: 'pg',
          debug: process.env.BOOKSHELF_SCHEMA_TESTS_DEBUG != null,
          connection: {
            host: '127.0.0.1',
            user: 'test',
            password: 'test',
            database: 'test',
            charset: 'utf8'
          },
          useNullAsDefault: true
        });
      default:
        throw new Error(`Unknown db variant: ${db_variant}`);
    }
  })();
  return db = Bookshelf(knex);
};

init = function(pluginOptions) {
  if (db != null) {
    return db;
  }
  db = initDb();
  db.plugin(Schema(pluginOptions));
  return db;
};

truncate = co(function*(...tables) {
  var table;
  return (yield ((function() {
    var i, len, results;
    results = [];
    for (i = 0, len = tables.length; i < len; i++) {
      table = tables[i];
      results.push(db.knex(table).truncate());
    }
    return results;
  })()));
});

users = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield knex.schema.dropTableIfExists('users');
  return (yield knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 255);
    table.string('password', 1024);
    table.string('email', 255);
    table.float('code');
    table.boolean('flag');
    table.dateTime('last_login');
    table.date('birth_date');
    table.json('additional_data');
    return table.integer('inviter_id');
  }));
});

photos = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield knex.schema.dropTableIfExists('photos');
  return (yield knex.schema.createTable('photos', function(table) {
    table.increments('id').primary();
    table.string('filename', 255);
    table.integer('user_id');
    return table.string('user_name', 255);
  }));
});

profiles = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield knex.schema.dropTableIfExists('profiles');
  return (yield knex.schema.createTable('profiles', function(table) {
    table.increments('id').primary();
    table.string('greetings', 255);
    return table.integer('user_id');
  }));
});

groups = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield [knex.schema.dropTableIfExists('groups'), knex.schema.dropTableIfExists('groups_users')];
  yield knex.schema.createTable('groups', function(table) {
    table.increments('id').primary();
    return table.string('name', 255);
  });
  return (yield knex.schema.createTable('groups_users', function(table) {
    table.integer('user_id');
    return table.integer('group_id');
  }));
});

tags = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield knex.schema.dropTableIfExists('tags');
  return (yield knex.schema.createTable('tags', function(table) {
    table.increments('id').primary();
    table.string('name', 255);
    table.integer('tagable_id');
    return table.string('tagable_type', 255);
  }));
});

inviters = co(function*() {
  var knex;
  if (!db) {
    init();
  }
  knex = db.knex;
  yield knex.schema.dropTableIfExists('inviters');
  return (yield knex.schema.createTable('inviters', function(table) {
    table.increments('id').primary();
    table.string('greeting');
    return table.integer('user_id');
  }));
});

module.exports = {
  initDb: initDb,
  init: init,
  truncate: truncate,
  users: users,
  photos: photos,
  profiles: profiles,
  groups: groups,
  tags: tags,
  inviters: inviters
};
