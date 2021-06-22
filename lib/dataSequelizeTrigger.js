'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const { Sequelize, sequelize } = require('./sequelizeStore');
const lookupModelSql = require('../utils/lookupModelSql');
const { get, isEmpty, map } = lodash;

function DataSequelizeTrigger(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);
  console.log("🚀 ~ file: dataSequelizeTrigger.js ~ line 14 ~ DataSequelizeTrigger ~ modelDescriptor", modelDescriptor)

  let schemaModels;

  if (!isEmpty(modelDescriptor)) {
    schemaModels = map(modelDescriptor, (doc) => {
      return sequelize.define(doc.name, doc.attributes, doc.options);
    })
  } else {
    schemaModels = []
  }

  console.log("DataSequelizeTrigger schemaModels", schemaModels);

  /**
   * FIND ALL
   * @param {*} params 
   */
  this.find = function ({ type }) {
  console.log("🚀 ~ file: dataSequelizeTrigger.js ~ line 34 ~ DataSequelizeTrigger ~ type", type)
    const model = lookupModelSql(schemaModels, type);
    console.log("🚀 ~ file: dataSequelizeTrigger.js ~ line 35 ~ DataSequelizeTrigger ~ model", model)
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