'use strict';

const _ = require('lodash');

/**
 * 2dsphere constant.
 */
const TWOD_SPHERE = '2dsphere';

/**
 * 2d constant.
 */
const TWOD = '2d';

/**
 * geohaystack constant.
 */
const GEO_HAYSTACK = 'geoHaystack';

/**
 * The valid value values.
 */
const VALID_VALUES = [ 1, -1, '2dsphere', '2d', 'geoHaystack', 'text', 'hashed' ];

/**
 * Represents the indexed field.
 */
class IndexField {

  /**
   * Instantiate the index field.
   *
   * @param {String} field - The field name.
   * @param {Object} value - The index value.
   */
  constructor(field, value) {
    this.field = field;
    if (_.indexOf(VALID_VALUES, value) < 0) {
      throw new Error(`Index types must be one of ${JSON.stringify(VALID_VALUES)} - got '${value}'`);
    }
    this.value = value;
  }

  /**
   * Determine if the field is a geo index.
   *
   * @returns {Boolean} If the index field is a geo index.
   */
  isGeo() {
    return this.value === TWOD_SPHERE ||
      this.value === TWOD ||
      this.value === GEO_HAYSTACK;
  }
}

module.exports = IndexField;
