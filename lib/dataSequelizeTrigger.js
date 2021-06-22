'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const { Sequelize, sequelize } = require('./sequelizeStore');
const { get } = lodash;

function DataSequelizeTrigger(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);

  let schemaModels;

  if (!isEmpty(modelDescriptor)) {
    schemaModels = map(modelDescriptor, (doc) => {
      return sequelize.define(doc.name, doc.attributes, doc.options);
    })
  } else {
    schemaModels = []
  }

  console.log("AAAAA", schemaModels);

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