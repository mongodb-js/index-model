var Model = require('ampersand-model');
var _ = require('lodash');

var IndexFieldCollection = require('./index-field').Collection;
var WarningCollection = require('./warnings').WarningCollection;

// var debug = require('debug')('mongodb-index-model:index-model');

var indexModelProps = {
  ns: 'string',
  key: 'object',
  name: 'string',
  size: 'number',
  usageCount: 'number',
  usageSince: 'date',
  usageHost: 'string',
  version: 'number',
  extra: 'object'
};

class IndexModel {
  /**
   * Instantiate the warning.
   *
   * @param {String} ns - The namespace.
   * @param {Object} key - The index key.
   * @param {String} name - The index name.
   * @param {Number} size - The size of the index.
   * @param {Number} usageCount - The number of times the index has been used.
   * @param {Date} usageSince - Last time used.
   * @param {String} usageHost - The ost.
   * @param {Number} version - The version.
   * @param {Object} extra - Extra info.
   */
  constructor(ns, key, name, size, usageCount, usageSince, usageHost, version, extra) {
    this.ns = ns;
    this.key = key;
    this.name = name;
    this.size = size;
    this.usageCount = usageCount;
    this.usageSince = usageSince;
    this.usageHost = usageHost;
    this.version = version;
    this.extra = extra;
    this.fields = new IndexFieldCollection();
    this.warnings = new WarningCollection();
  }
  unique() {
    return this.name === '_id_' || !!this.extra.unique;
  }
  sparse() {
    return !!this.extra.sparse;
  }
  ttl() {
    return !!this.extra.expireAfterSeconds;
  }
  hashed() {
    return _.values(this.key).indexOf('hashed') > -1;
  }
  geo() {
    return !!this.extra['2dsphereIndexVersion'] ||
      _.values(this.key).indexOf('2d') > -1 ||
      _.values(this.key).indexOf('geoHaystack') > -1;
  }
  compound() {
    return _.keys(this.key).length > 1;
  }
  single() {
    return !this.compound();
  }
  partial() {
    return !!this.extra.partialFilterExpression;
  }
  text() {
    return !!this.extra.textIndexVersion;
  }
  isCollation() {
    return !!this.extra.collation;
  }
  getType() {
    if (this.geo()) {
      return 'geospatial';
    }
    if (this.hashed()) {
      return 'hashed';
    }
    if (this.text()) {
      return 'text';
    }
    return 'regular';
  }
  cardinality() {
    return this.single() ? 'single' : 'compound';
  }
  properties() {
    var model = this;
    var props = ['unique', 'sparse', 'partial', 'ttl', 'isCollation'];
    return _.filter(props, function(prop) {
      return !!model[prop]();
    }).sort(function(a, b) {
      var order = {
        'unique': 1,
        'sparse': 2,
        'partial': 3,
        'ttl': 4,
        'isCollation': 5
      };
      return order[a] - order[b];
    });
  }

  parse(attrs) {
    // rename v to version
    attrs.version = attrs.v;
    delete attrs.v;

    // move all other fields to a nested `extra` object
    attrs.extra = _.omit(attrs, _.keys(indexModelProps));
    _.each(_.keys(attrs.extra), function(key) {
      delete attrs[key];
    });

    // fields
    attrs.fields = _.map(attrs.key, function(val, key) {
      return {
        field: key,
        value: val
      };
    });

    return attrs;
  }

  serialize() {
  return this.getAttributes({
    props: true, derived: true
  });
}

}

// var IndexModel = Model.extend({
//   namespace: 'Index',
//   idAttribute: 'id',
//   extraProperties: 'reject',
//   props: indexModelProps,
//   session: {
//     relativeSize: 'number'
//   },
//   derived: {
//     id: {
//       deps: ['name', 'ns'],
//       fn: function() {
//         return this.ns + '.' + this.name;
//       }
//     },
//     unique: {
//       deps: ['extra', 'name'],
//       fn: function() {
//         return this.name === '_id_' || !!this.extra.unique;
//       }
//     },
//     sparse: {
//       deps: ['extra'],
//       fn: function() {
//         return !!this.extra.sparse;
//       }
//     },
//     ttl: {
//       deps: ['extra'],
//       fn: function() {
//         return !!this.extra.expireAfterSeconds;
//       }
//     },
//     hashed: {
//       deps: ['key'],
//       fn: function() {
//         return _.values(this.key).indexOf('hashed') > -1;
//       }
//     },
//     geo: {
//       deps: ['extra', 'key'],
//       fn: function() {
//         return !!this.extra['2dsphereIndexVersion'] ||
//           _.values(this.key).indexOf('2d') > -1 ||
//           _.values(this.key).indexOf('geoHaystack') > -1;
//       }
//     },
//     compound: {
//       deps: ['key'],
//       fn: function() {
//         return _.keys(this.key).length > 1;
//       }
//     },
//     single: {
//       deps: ['compound'],
//       fn: function() {
//         return !this.compound;
//       }
//     },
//     partial: {
//       deps: ['extra'],
//       fn: function() {
//         return !!this.extra.partialFilterExpression;
//       }
//     },
//     text: {
//       deps: ['extra'],
//       fn: function() {
//         return !!this.extra.textIndexVersion;
//       }
//     },
//     collation: {
//       deps: ['extra'],
//       fn: function() {
//         return !!this.extra.collation;
//       }
//     },
//     type: {
//       deps: ['geo', 'hashed', 'text'],
//       fn: function() {
//         if (this.geo) {
//           return 'geospatial';
//         }
//         if (this.hashed) {
//           return 'hashed';
//         }
//         if (this.text) {
//           return 'text';
//         }
//         return 'regular';
//       }
//     },
//     cardinality: {
//       deps: ['single'],
//       fn: function() {
//         return this.single ? 'single' : 'compound';
//       }
//     },
//     properties: {
//       deps: ['unique', 'sparse', 'partial', 'ttl', 'collation'],
//       fn: function() {
//         var model = this;
//         var props = ['unique', 'sparse', 'partial', 'ttl', 'collation'];
//         return _.filter(props, function(prop) {
//           return !!model[prop];
//         }).sort(function(a, b) {
//           var order = {
//             'unique': 1,
//             'sparse': 2,
//             'partial': 3,
//             'ttl': 4,
//             'collation': 5
//           };
//           return order[a] - order[b];
//         });
//       }
//     }
//   },
//   collections: {
//     fields: IndexFieldCollection,
//     warnings: WarningCollection
//   },
//   parse: function(attrs) {
//     // rename v to version
//     attrs.version = attrs.v;
//     delete attrs.v;
//
//     // move all other fields to a nested `extra` object
//     attrs.extra = _.omit(attrs, _.keys(indexModelProps));
//     _.each(_.keys(attrs.extra), function(key) {
//       delete attrs[key];
//     });
//
//     // fields
//     attrs.fields = _.map(attrs.key, function(val, key) {
//       return {
//         field: key,
//         value: val
//       };
//     });
//
//     return attrs;
//   },
//   serialize: function() {
//     return this.getAttributes({
//       props: true, derived: true
//     });
//   }
// });

module.exports = IndexModel;
