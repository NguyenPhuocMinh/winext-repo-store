'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const lookupModel = require('../utils/lookupModel');
const { get, isEmpty, map } = lodash;

function DataStoreTrigger(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);

  let schemaModels;

  if (!isEmpty(modelDescriptor)) {
    schemaModels = map(modelDescriptor, (doc) => {
      return mongoose.model(doc.name, doc.attributes, doc.options.collection);
    })
  } else {
    schemaModels = []
  }

  /**
   * FIND ONE
   * @param {*} params
   */
  this.findOne = function ({ type, filter = {}, projection = {}, populates = [] }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`,
    })
    const model = lookupModel(schemaModels, type);
    if (!isEmpty(populates)) {
      return model.findOne(filter, projection)
        .then(docs => model.populate(docs, populates))
        .then(result => result)
        .catch(err => {
          loggerFactory.error(`FindOne with populates has error : ${err} `, {
            requestId: `${requestId}`
          })
          return Promise.reject(err);
        })
    }
    return model.findOne(filter, projection)
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`FindOne with populates has error ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  /**
   * COUNT
   * @param {*} params
   */
  this.count = function ({ type, filter = {} }) {
    loggerFactory.warn(`Model name : ${type}`, {
      requestId: `${requestId}`,
    })
    const model = lookupModel(schemaModels, type);
    return model.countDocuments(filter).exec();
  };
  /**
   * CREATE
   * @param {*} params 
   */
  this.create = function ({ type, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    const doc = new model(data)
    return model.create(doc)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Create has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err)
      })
  };
  /**
   * FIND
   * @param {*} params 
   */
  this.find = function ({ type, filter = {}, projection = {}, options = {}, populates = [] }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    if (!isEmpty(populates)) {
      return model.find(filter, projection, options)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggerFactory.error(`Find has error : ${err} `, {
            requestId: `${requestId}`
          })
          return Promise.reject(err)
        })
    }
    return model.find(filter, projection, options).exec();
  };
  /**
   * GET
   * @param {*} params 
   */
  this.get = function ({ type, id, projection = {}, populates }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    if (!isEmpty(populates)) {
      return model.findById(id, projection)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggerFactory.error(`Get has error : ${err}`, {
            requestId: `${requestId}`
          })
          return Promise.reject(err)
        })
    }
    return model.findById(id, projection).exec();
  };
  /**
   * UPDATE
   * @param {*} params 
   */
  this.update = function ({ type, id, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndUpdate(id, data, { new: true }).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Update has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE ONE
   * @param {*} params 
   */
  this.updateOne = function ({ type, id, data }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.updateOne({ _id: id }, data).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`UpdateOne has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  /**
   * UPDATE MANY
   * @param {*} params 
   */
  this.updateMany = function ({ type, filter, data = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    return model.updateMany(filter, data).exec();
  }
  /**
   * AGGREGATE
   * @param {*} params 
   */
  // aggregate
  this.aggregate = function ({ type, pipeline }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    return model.aggregate(pipeline)
      .exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Aggregate has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  /**
   * DELETED
   * @param {*} params 
   */
  this.deleted = function ({ type, id }) {
    loggerFactory.warn(`Model name: ${type}`, `${id}`, {
      requestId: `${requestId}`
    })
    const model = lookupModel(schemaModels, type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndRemove(id).exec()
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`deleted has error : ${err}`, {
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
};

exports = module.exports = new DataStoreTrigger();
exports.register = DataStoreTrigger;
