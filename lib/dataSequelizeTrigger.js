'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');

function DataSequelizeTrigger(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);

  /**
   * FIND ALL
   * @param {*} params 
   */
  this.find = function ({ type }) {

  }
  /**
   * CREATE
   * @param {*} params 
   */
  this.create = function ({ type }) {

  }
};

exports = module.exports = new DataSequelizeTrigger();
exports.register = DataSequelizeTrigger;