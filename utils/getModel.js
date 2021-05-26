'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const { models, modelNames } = mongoose;

function GetModel(type) {
  let model = null;
  if (lodash.includes(modelNames(), type)) {
    return model = models[type];
  }
  throw new Error('InvalidNameModel');
};

module.exports = GetModel;