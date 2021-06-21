'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const { models } = mongoose;

function LookupModel(schemaModels, type) {
  let model = null;
  if (lodash.includes(schemaModels, models[type])) {
    return model = models[type];
  }
  throw new Error('InvalidNameModel');
};

module.exports = LookupModel;