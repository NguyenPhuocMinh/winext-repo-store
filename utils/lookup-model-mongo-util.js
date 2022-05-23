'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const { models } = mongoose;
const { includes } = lodash;

function LookupModelMongo(schemaModels, type) {
  let model = null;
  if (includes(schemaModels, models[type])) {
    model = models[type];
    return model;
  }
  throw new Error('InvalidNameModel');
}

module.exports = LookupModelMongo;
