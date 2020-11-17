'use strict';

const winrow = require('winrow');
const { Promise, lodash, getRequestId } = winrow;
const getModel = require('../config/getModel');
const loggingFactory = require('winrow-logger');
const { isEmpty } = lodash;
const { name } = require('../package.json');

function DataStore() {
  const requestId = getRequestId();
  // findOne
  this.findOne = function ({ type, filter = {}, projection = {}, populates = [] }) {
    loggingFactory.data(`Info findOne : ${type}`, `${filter}`, `${projection}`, `${populates}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (!isEmpty(populates)) {
      return model.findOne(filter, projection)
        .then(docs => model.populate(docs, populates))
        .then(result => {
          loggingFactory.debug(`DataStore findOne result with populates : ${result}`, {
            labelName: `[${name.toUpperCase()}]`,
            requestId: `${requestId}`
          })
          return result;
        })
        .catch(err => {
          loggingFactory.error(`FindOne with populates has error : ${err} `, {
            labelName: `[${name.toUpperCase()}]`,
            requestId: `${requestId}`
          })
          return Promise.reject(err);
        })
    }
    return model.findOne(filter, projection)
      .then(docs => {
        loggingFactory.debug(`DataStore findOne result with not populates : ${result}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return docs
      })
      .catch(err => {
        loggingFactory.error(`FindOne with populates has error ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  // count
  this.count = function ({ type, filter = {} }) {
    loggingFactory.data(`Info count : ${type}`, `${filter}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    return model.countDocuments(filter).exec();
  };
  // create
  this.create = function ({ type, data }) {
    loggingFactory.data(`Info create : ${type}`, `${data}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    const doc = new model(data)
    return model.create(doc)
      .then(result => {
        loggingFactory.data(`Result create : ${result}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return result
      })
      .catch(err => {
        loggingFactory.error(`Create has error : ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err)
      })
  };
  // find
  this.find = function ({ type, filter = {}, projection = {}, options = {}, populates = [] }) {
    loggingFactory.data(`Info find : ${type}`, `${filter}`, `${projection}`, `${options}`, `${populates}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (!isEmpty(populates)) {
      return model.find(filter, projection, options)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggingFactory.error(`Find has error : ${err} `, {
            labelName: `[${name.toUpperCase()}]`,
            requestId: `${requestId}`
          })
          return Promise.reject(err)
        })
    }
    return model.find(filter, projection, options).exec();
  };
  // get
  this.get = function ({ type, id, projection = {}, populates }) {
    loggingFactory.data(`Info get : ${type}`, `${id}`, `${projection}`, `${populates}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    if (!isEmpty(populates)) {
      return model.findById(id, projection)
        .then(docs => model.populate(docs, populates))
        .catch(err => {
          loggingFactory.error(`Get has error : ${err}`, {
            labelName: `[${name.toUpperCase()}]`,
            requestId: `${requestId}`
          })
          return Promise.reject(err)
        })
    }
    return model.findById(id, projection).exec();
  };
  // update
  this.update = function ({ type, id, data }) {
    loggingFactory.data(`Info update : ${type}`, `${id}`, `${data}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndUpdate(id, data, { new: true }).exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error(`Update has error : ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      });
  };
  // updateOne
  this.updateOne = function ({ type, id, data }) {
    loggingFactory.data(`Info update : ${type}`, `${id}`, `${data}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.updateOne({ _id: id }, data).exec()
      .then(docs => {
        loggingFactory.data(`updateOne result : ${docs}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return docs
      })
      .catch(err => {
        loggingFactory.error(`UpdateOne has error : ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  // aggregate
  this.aggregate = function ({ type, pipeline }) {
    loggingFactory.data(`Info aggregate : ${type}`, `${pipeline}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    return model.aggregate(pipeline)
      .exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error(`Aggregate has error : ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
  // deleted
  this.deleted = function ({ type, id }) {
    loggingFactory.data(`Info deleted : ${type}`, `${id}`, {
      labelName: `[${name.toUpperCase()}]`,
      requestId: `${requestId}`
    })
    const model = getModel(type);
    if (isEmpty(id)) {
      throw new Error('IdNotFound');
    }
    return model.findByIdAndRemove(id).exec()
      .then(docs => docs)
      .catch(err => {
        loggingFactory.error(`deleted has error : ${err}`, {
          labelName: `[${name.toUpperCase()}]`,
          requestId: `${requestId}`
        })
        return Promise.reject(err);
      })
  };
};

module.exports = new DataStore();