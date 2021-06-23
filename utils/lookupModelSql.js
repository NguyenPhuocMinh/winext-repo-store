'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const { get, includes } = lodash;

function LookupModelSql(schemaModels, type, sequelize) {
  const models = get(sequelize, 'models');
  
  let model = null;
  if (includes(schemaModels, models[type])) {
    return model = models[type];
  }
  throw new Error('InvalidNameModel');
};

module.exports = LookupModelSql;