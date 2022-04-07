'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const errorManager = winext.require('winext-error-manager');
const lookupModelMongo = require('../utils/lookupModelMongo');
const errorCodes = require('../config/errorCodes');
const { get, isEmpty, map, isNil } = lodash;

function DataStoreTrigger(params = {}) {
  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);

  let schemaModels;

  if (!isEmpty(modelDescriptor)) {
    schemaModels = map(modelDescriptor, (doc) => {
      return mongoose.model(doc.name, doc.attributes, doc.options.collection);
    });
  } else {
    schemaModels = [];
  }

  /**
   * FIND ONE
   * @param {*} type
   * @param {*} filter
   * @param {*} projection
   * @param {*} populates
   */
  this.findOne = function ({ type, filter = {}, projection = {}, populates = [] }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (!isEmpty(populates)) {
      return model.findOne(filter, projection)
        .then(docs => model.populate(docs, populates))
        .then(result => result)
        .catch(err => {
          loggerFactory.error(`FindOne with populates has error : ${err} `, {
            requestId: `${requestId}`
          });
          return Promise.reject(err);
        });
    }
    return model.findOne(filter, projection)
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`FindOne with populates has error ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * COUNT
   * @param {*} type
   * @param {*} filter
   */
  this.count = function ({ type, filter = {} }) {
    loggerFactory.warn(`Model name : ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    return model.countDocuments(filter).exec();
  };
  /**
   * CREATE
   * @param {*} type
   * @param {*} data
   */
  this.create = function ({ type, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    const doc = new model(data);
    return model.create(doc)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Create has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * FIND
   * @param {*} type
   * @param {*} filter
   * @param {*} projection
   * @param {*} options
   * @param {*} populates
   */
  this.find = function ({ type, filter = {}, projection = {}, options = {}, populates = [] }) {
    if (!isEmpty(options)) {
      if (!isNil(options.limit)) {
        if (options.limit === 0) {
          throw errorManager.newError('InvalidLimitOptions', errorCodes);
        }
      }
    }

    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (!isEmpty(populates)) {
      return model.find(filter, projection, options)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggerFactory.error(`Find has error : ${err} `, {
            requestId: `${requestId}`
          });
          return Promise.reject(err);
        });
    }
    return model.find(filter, projection, options).exec();
  };
  /**
   * GET
   * @param {*} type
   * @param {*} id
   * @param {*} projection
   * @param {*} populates
   */
  this.get = function ({ type, id, projection = {}, populates }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (isEmpty(id)) {
      throw errorManager.newError('IdNotFound', errorCodes);
    }
    if (!isEmpty(populates)) {
      return model.findById(id, projection)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggerFactory.error(`Get has error : ${err}`, {
            requestId: `${requestId}`
          });
          return Promise.reject(err);
        });
    }
    return model.findById(id, projection).exec();
  };
  /**
   * UPDATE
   * @param {*} type
   * @param {*} id
   * @param {*} data
   */
  this.update = function ({ type, id, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (isEmpty(id)) {
      throw errorManager.newError('IdNotFound', errorCodes);
    }
    return model.findByIdAndUpdate(id, data, { new: true }).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Update has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE ONE
   * @param {*} type
   * @param {*} id
   * @param {*} data
   */
  this.updateOne = function ({ type, id, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (isEmpty(id)) {
      throw errorManager.newError('IdNotFound', errorCodes);
    }
    return model.updateOne({ _id: id }, data).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`UpdateOne has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE MANY
   * @param {*} type
   * @param {*} filter
   * @param {*} data
   */
  this.updateMany = function ({ type, filter, data = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    return model.updateMany(filter, data).exec();
  };
  /**
   * AGGREGATE
   * @param {*} type
   * @param {*} pipeline
   */
  // aggregate
  this.aggregate = function ({ type, pipeline }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    return model.aggregate(pipeline)
      .exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Aggregate has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * DELETED
   * @param {*} type
   * @param {*} id
   */
  this.deleted = function ({ type, id }) {
    loggerFactory.warn(`Model name: ${type}`, `${id}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelMongo(schemaModels, type);
    if (isEmpty(id)) {
      throw errorManager.newError('IdNotFound', errorCodes);
    }
    return model.findByIdAndRemove(id).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`deleted has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
}

exports = module.exports = new DataStoreTrigger();
exports.register = DataStoreTrigger;
