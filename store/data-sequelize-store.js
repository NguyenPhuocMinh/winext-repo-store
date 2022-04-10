'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const dotenv = winext.require('dotenv');
const lookupModelSql = require('../utils/lookupModelSql');
const { get, isEmpty, map } = lodash;

function DataSequelizeStore(params = {}) {
  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);
  // config env
  dotenv.config();

  const mysqlConfig = get(params, 'config.mysql');
  const enableMySql = get(mysqlConfig, 'enable', false);
  const hostMySql = process.env.SQL_HOST || get(mysqlConfig, 'host', 'localhost');
  const portMySql = process.env.SQL_PORT || get(mysqlConfig, 'port', 3306);
  const userMysql = process.env.SQL_USER || get(mysqlConfig, 'user', 'root');
  const passwordMysql = process.env.SQL_PASSWORD || get(mysqlConfig, 'password', 'root');
  const databaseMySql = process.env.SQL_DATABASE || get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', 'mysql');
  const pool = get(sequelizeOptions, 'pool', {});

  const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
    pool: pool
  });

  let schemaModels;

  if (!isEmpty(modelDescriptor)) {
    schemaModels = map(modelDescriptor, (doc) => {
      if (enableMySql && !isEmpty(sequelize)) {
        return sequelize.define(doc.name, doc.attributes, doc.options);
      } else {
        return doc;
      }
    });
  } else {
    schemaModels = [];
  }

  this.sequelize = sequelize;
  this.Sequelize = Sequelize;

  /**
   * FIND ONE
   * @param {*} type
   * @param {*} options
   */
  this.findOne = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.findOne(options)
      .then(doc => doc)
      .catch(err => {
        loggerFactory.error(`Find one has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * COUNT
   * @param {*} type
   * @param {*} options
   */
  this.count = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.count(options)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Count has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * FIND ALL
   * @param {*} type
   * @param {*} options
   */
  this.find = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.findAll(options)
      .then(docs => docs)
      .catch(err => {
        loggerFactory.error(`Find has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
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
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.create(data)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Create has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * CREATE MANY
   * @param {*} type
   * @param {*} data
   * @param {*} options
   */
  this.createMany = function ({ type, data = {}, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.bulkCreate([data], options)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Create many has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE
   * @param {*} type
   * @param {*} data
   * @param {*} options
   */
  this.update = function ({ type, data = {}, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.update(data, options)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Update has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
  /**
   * DELETE
   * @param {*} type
   * @param {*} options
   */
  this.deleted = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`, {
      requestId: `${requestId}`
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model.destroy(options)
      .then(result => result)
      .catch(err => {
        loggerFactory.error(`Deleted has error : ${err}`, {
          requestId: `${requestId}`
        });
        return Promise.reject(err);
      });
  };
}

exports = module.exports = new DataSequelizeStore();
exports.register = DataSequelizeStore;
