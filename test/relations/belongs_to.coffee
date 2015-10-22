Bookshelf = require 'bookshelf'
Schema = require '../../src/'
init = require '../init'
Fields = require '../../src/fields'
Relations = require '../../src/relations'

{StringField, IntField, EmailField} = Fields
{HasMany, BelongsTo} = Relations

describe "Relations", ->
    this.timeout 3000
    db = null
    User = null
    Photo = null
    Inviter = null

    fixtures =
        alice: co ->
            alice = yield new User(username: 'alice').save()
            photos = yield [
                new Photo(filename: 'photo1.jpg', user_id: alice.id).save()
                new Photo(filename: 'photo2.jpg', user_id: alice.id).save()
            ]
            [alice, photos]
        aliceAndBob: co ->
            [alice, bob] = yield [
                 new User(username: 'alice').save()
                 new User(username: 'bob').save()
            ]
            inviter = yield new Inviter(greeting: 'Hello Bob!', user_id: alice.id).save()
            yield bob.save(inviter_id: inviter.id)
            [alice, bob, inviter]

    before co ->
        db = init.init()
        yield [ init.users(), init.photos() ]

    describe 'BelongsTo', ->
        beforeEach ->
            class Photo extends db.Model
                tableName: 'photos'

            class User extends db.Model
                tableName: 'users'
                @schema [
                    StringField 'username'
                    HasMany Photo
                ]

            Photo.schema [
                StringField 'filename'
                BelongsTo User
            ]

        afterEach -> init.truncate 'users', 'photos'

        it 'creates accessor', co ->
            [alice, [photo1, _]] = yield fixtures.alice()
            photo1.user.should.be.a 'function'
            yield photo1.load 'user'
            photo1.$user.should.be.an.instanceof User
            photo1.$user.username.should.equal alice.username

        it 'can assign model', co ->
            [alice, [photo1, _]] = yield fixtures.alice()

            bob = yield new User(username: 'bob').save()
            yield photo1.$user.assign bob
            photo1 = yield Photo.forge(id: photo1.id).fetch(withRelated: 'user')
            photo1.user_id.should.equal bob.id
            photo1.$user.id.should.equal bob.id

        it 'can assign plain object', co ->
            [alice, [photo1, _]] = yield fixtures.alice()

            yield photo1.$user.assign {username: 'bob'}
            photo1 = yield Photo.forge(id: photo1.id).fetch(withRelated: 'user')
            photo1.$user.username.should.equal 'bob'

        it 'can assign by id', co ->
            [alice, [photo1, _]] = yield fixtures.alice()

            bob = yield new User(username: 'bob').save()
            yield photo1.$user.assign bob.id
            photo1 = yield Photo.forge(id: photo1.id).fetch(withRelated: 'user')
            photo1.user_id.should.equal bob.id
            photo1.$user.id.should.equal bob.id

        it 'can assign null as a related object', co ->
            [alice, [photo1, _]] = yield fixtures.alice()

            yield photo1.$user.assign(null)
            photo1 = yield Photo.forge(id: photo1.id).fetch()
            expect(photo1.user_id).to.be.null

    # XXX doesn't work with self-join
    describe 'through', ->
        before -> init.inviters()

        beforeEach ->
            class Inviter extends db.Model
                tableName: 'inviters'

            class User extends db.Model
                tableName: 'users'

                @schema [
                    StringField 'username'
                    BelongsTo User, name: 'inviter', through: Inviter
                ]

            Inviter.schema [
                StringField 'greeting'
            ]

        afterEach -> init.truncate 'users', 'inviters'

        it 'can access related model', co ->
            [alice, bob, inviter] = yield fixtures.aliceAndBob()
            yield bob.load('inviter')
            bob.$inviter.should.be.an.instanceof User
            bob.$inviter.id.should.equal alice.id
