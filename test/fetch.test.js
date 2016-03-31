var MongoClient = require('mongodb').MongoClient;
var fetch = require('../lib/fetch');
var assert = require('assert');
var _ = require('lodash');

// var debug = require('debug')('mongodb-index-model:text:fetch');

describe('index-model fetch()', function() {
  context('local', function() {
    this.slow(2000);
    this.timeout(10000);

    before(require('mongodb-runner/mocha/before')());
    after(require('mongodb-runner/mocha/after')());

    it('should connect to `localhost:27017` and get indexes', function(done) {
      MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        assert.ifError(err);
        fetch(db, 'mongodb.fanclub', function(err2, res) {
          assert.ifError(err2);
          assert.equal(res[0].name, '_id_');
          assert.ok(_.isNumber(res[0].size));
          done();
        });
      });
    });
  });
});
