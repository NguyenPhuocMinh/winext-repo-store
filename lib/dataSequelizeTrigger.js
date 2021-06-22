'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const { sequelize } = require('./sequelizeStore');
const lookupModelSql = require('../utils/lookupModelSql');
const { get, isEmpty, map } = lodash;

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
    schemaModels = [];
  }

  /**
   * FIND ONE
   * @param {*} params 
   */
  this.findOne = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`,
    })
    const model = lookupModelSql(schemaModels, type);
    return model.findOne(options)
      .then(doc => doc)
      .catch(err => {
        loggerFactory.error(`Find one has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  }

  /**
   * FIND ALL
   * @param {*} params 
   */
  this.find = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`,
    })
    const model = lookupModelSql(schemaModels, type);
    return model.findAll(options)
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Find has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      });
  }
  /**
   * CREATE
   * @param {*} params 
   */
  this.create = function ({ type, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`,
    })
    const model = lookupModelSql(schemaModels, type);
    return model.create(data)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Create has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  }
};

exports = module.exports = new DataSequelizeTrigger();
exports.register = DataSequelizeTrigger;