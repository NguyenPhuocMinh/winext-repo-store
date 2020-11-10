'use strict';

const winrow = require('winrow');
const { Promise, lodash, getRequestId } = winrow;
const getModel = require('../config/getModel');
const loggingFactory = require('winrow-logger');
const { isEmpty } = lodash;

function DataStore() {
  const requestId = getRequestId();
  // find One
  this.findOne = function ({ type, filter = {}, projection = {}, populates }) {
    const model = getModel(type);
    if (!isEmpty(populates)) {
      return model.findOne(filter, projection)
        .then(docs => model.populate(docs, populates))
        .then(result => result)
        .catch(err => {
          loggingFactory.error('FindOne Error', { error: err, requestId: `${requestId}` })
          return Promise.reject(err);
        })
    }
    return model.findOne(filter, projection)
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error('FindOne Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err);
      })

  };
  // count
  this.count = function ({ type, filter = {} }) {
    const model = getModel(type);
    return model.countDocuments(filter).exec();
  };
  // create
  this.create = function ({ type, data }) {
    const model = getModel(type);
    const doc = new model(data)
    return model.create(doc)
      .then(result => result)
      .catch(err => {
        loggingFactory.error('Create Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err)
      })
  };
  // find
  this.find = function ({ type, filter = {}, projection = {}, options = {}, populates }) {
    const model = getModel(type);
    if (!isEmpty(populates)) {
      return model.find(filter, projection, options)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggingFactory.error('Find Error', { error: err, requestId: `${requestId}` })
          return Promise.reject(err)
        })
    }
    return model.find(filter, projection, options).exec();
  };
  // get
  this.get = function ({ type, id, projection = {}, populates }) {
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    if (!isEmpty(populates)) {
      return model.findById(id, projection)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggingFactory.error('Get Error', { error: err, requestId: `${requestId}` })
          return Promise.reject(err)
        })
    }
    return model.findById(id, projection).exec();
  };
  // update
  this.update = function ({ type, id, data }) {
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndUpdate(id, data, { new: true }).exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error('Update Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err);
      });
  };
  // updateOne
  this.updateOne = function ({ type, id, data }) {
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.updateOne({ _id: id }, data).exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error('UpdateOne Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err);
      })
  };
  // aggregate
  this.aggregate = function ({ type, pipeline }) {
    const model = getModel(type);
    return model.aggregate(pipeline)
      .exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error('Aggregate Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err);
      })
  };
  // deleted
  this.deleted = function ({ type, id }) {
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndRemove(id).exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error('Deleted Error', { error: err, requestId: `${requestId}` })
        return Promise.reject(err);
      })
  }
};

module.exports = new DataStore();