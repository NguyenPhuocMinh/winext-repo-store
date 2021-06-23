'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const sequelizeStore = require('../lib/repository').sequelizeStore;
const { models } = sequelizeStore.sequelize;
const { includes } = lodash;

function LookupModelSql(schemaModels, type) {
  let model = null;
  if (includes(schemaModels, models[type])) {
    return model = models[type];
  }
  throw new Error('InvalidNameModel');
};

module.exports = LookupModelSql;