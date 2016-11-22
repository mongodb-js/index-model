const assert = require('assert');
const Index = require('../');
const _ = require('lodash');

const INDEX_FIXTURE = require('./fixture');

describe('mongodb-index-model', function() {
  let indexes;

  before(function() {
    indexes = _.map(INDEX_FIXTURE, (index) => {
      return new Index(index, { parse: true });
    });
  });

  context('IndexModel', function() {
    it('should have all indexes in the collection', function() {
      assert.equal(indexes.length, 9);
    });

    it('should get the names right', function() {
      assert.deepEqual(_.map(indexes, 'name').sort(), [
        '$**_text',
        '_id_',
        '_id_1_gender_-1',
        'big-index',
        'email_1_favorite_features_1',
        'last_login_-1',
        'last_position_2dsphere',
        'seniors',
        'seniors-inverse']);
    });

    it('should have the correct namespace', function() {
      _.each(_.map(indexes, 'ns'), function(ns) {
        assert.equal(ns, 'mongodb.fanclub');
      });
    });

    it('should have the correct version', function() {
      _.each(_.map(indexes, 'version'), function(v) {
        assert.equal(v, 1);
      });
    });

    it('should set all derived properties to false for regular indexes', function() {
      var index = _.find(indexes, { name: 'last_login_-1' });
      assert.equal(index.unique, false);
      assert.equal(index.sparse, false);
      assert.equal(index.ttl, false);
      assert.equal(index.hashed, false);
      assert.equal(index.geo, false);
      assert.equal(index.compound, false);
      assert.equal(index.geo, false);
      assert.equal(index.partial, false);
      assert.equal(index.collation, false);
    });

    it('should recognize geo indexes', function() {
      assert.equal(_.find(indexes, { name: 'last_position_2dsphere' }).geo, true);
    });

    it('should recognize compound indexes', function() {
      assert.equal(_.find(indexes, { name: 'email_1_favorite_features_1' }).compound, true);
    });

    it('should return the correct `properties` array', function() {
      var index = _.find(indexes, { name: 'seniors' });
      assert.deepEqual(index.properties, ['partial']);
      index = _.find(indexes, { name: 'last_login_-1' });
      assert.deepEqual(index.properties, []);
      index = _.find(indexes, { name: '_id_' });
      assert.deepEqual(index.properties, ['unique']);
    });

    it('should recognize text indexes', function() {
      assert.equal(_.find(indexes, { name: '$**_text' }).text, true);
    });

    it('should recognize unique indexes', function() {
      assert.equal(_.find(indexes, { name: '_id_' }).unique, true);
    });

    it('should recognize partial indexes', function() {
      assert.equal(_.find(indexes, { name: 'seniors' }).partial, true);
      assert.deepEqual(_.find(indexes, { name: 'seniors' }).extra.partialFilterExpression,
        {
          'age': {
            '$gt': 50
          }
        });
    });

    it('should serialize correctly', function() {
      var serialized = _.map(indexes, (model) => {
        return model.serialize();
      });
      assert.ok(_.isArray(serialized));
      var index = serialized[0];
      assert.ok(index.ns);
      assert.ok(index.key);
      assert.ok(index.name);
      assert.ok(index.version);
      assert.ok(index.extra);
      assert.ok(index.type);
      assert.ok(index.cardinality);
      assert.ok('unique' in index);
      assert.ok('sparse' in index);
      assert.ok('ttl' in index);
      assert.ok('hashed' in index);
      assert.ok('geo' in index);
      assert.ok('compound' in index);
      assert.ok('partial' in index);
      assert.ok('text' in index);
    });
  });

  context('IndexField', function() {
    it('should accept numbers as index field values', function() {
      assert.equal(_.find(indexes, { name: 'seniors' }).fields[0].field, 'name');
      assert.equal(_.find(indexes, { name: 'seniors' }).fields[0].value, 1);
    });

    it('should accept dotted field names', function() {
      assert.equal(_.find(indexes, { name: 'seniors' }).fields[1].field, 'address.city');
      assert.equal(_.find(indexes, { name: 'seniors' }).fields[1].value, 1);
    });

    it('should accept selected strings as index field values', function() {
      assert.equal(_.find(indexes, { name: 'last_position_2dsphere' }).fields[0].value, '2dsphere');
    });

    it('should correctly set the `geo` flag', function() {
      assert.equal(_.find(indexes, { name: 'seniors' }).fields[0].isGeo(), false);
      assert.equal(_.find(indexes, { name: 'last_position_2dsphere' }).fields[0].isGeo(), true);
    });

    it('should not allow arbitary strings as values', function() {
      assert.throws(function() {
        /* eslint no-new: 0 */
        new Index({
          name: 'badIndex',
          key: {
            foo: 'someStrangeValue'
          }
        }, {
          parse: true
        });
      });
    });
  });
});
