'use strict';

const _ = require('lodash');

/**
 * Allowable warnings.
 */
const WARNINGS = {
  'IXWARN_PREFIX': 1,
  'IXWARN_UNUSED': 2
};

/**
 * The warning values.
 */
const WARNING_VALUES = _.values(WARNINGS);

/**
 * Wraps an index warning.
 */
class Warning {

  /**
   * Instantiate the warning.
   *
   * @param {Number} code - The error code.
   * @param {String} message - The message.
   * @param {String} details - The details.
   */
  constructor(code, message, details) {
    if (_.indexOf(WARNING_VALUES, code) < 0) {
      throw new Error(`Index warning codes must be one of ${JSON.stringify(WARNING_VALUES)} - got '${code}'`);
    }
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

module.exports = Warning;
module.exports.WARNINGS = WARNINGS;
