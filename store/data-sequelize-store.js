'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const dotenv = winext.require('dotenv');
const errorManager = winext.require('winext-error-manager');
const lookupModelSql = require('../utils/lookup-model-sql-util');
const errorCodes = require('../config/errorCodes');
const { MANY_TO_MANY } = require('../config/associations');
const { get, isEmpty, map } = lodash;

const options = require('../conf/options');
const profiles = require('../conf/profiles');

function DataSequelizeStore(params = {}) {
  const loggerFactory = get(params, 'loggerFactory');
  const modelDescriptor = get(params, 'modelDescriptor', []);
  // config env
  dotenv.config();

  const mysqlConfig = get(params, 'config.mysql');
  const enableMySql = get(mysqlConfig, 'enable', false);
  const hostMySql = profiles.hostMySql || get(mysqlConfig, 'host', 'localhost');
  const portMySql = profiles.portMySql || get(mysqlConfig, 'port', 3306);
  const userMysql = profiles.userMysql || get(mysqlConfig, 'user', 'root');
  const passwordMysql = profiles.passwordMysql || get(mysqlConfig, 'password', 'root');
  const databaseMySql = profiles.databaseMySql || get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', options.sequelizeOptions.mysql);
  const pool = get(sequelizeOptions, 'pool', {});

  const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
    pool: pool,
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
   * @example
   * const data = await dataSequelizeStore.findOne({
   *    type: 'UserModel',
   *    options : { where: { id: '123' } },
   * })
   * @returns {Object} data
   */
  this.findOne = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findOne(options)
      .then((doc) => doc)
      .catch((err) => {
        loggerFactory.error(`Find one has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * COUNT
   * @param {*} type
   * @param {*} options
   * @example
   * const data = await dataSequelizeStore.count({
   *    type: 'UserModel',
   *    options : {
   *        where: {
   *         id: {
   *          [Op.gt]: 25
   *        }
   *      }
   *    },
   * })
   * @returns {Object}
   */
  this.count = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .count(options)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`Count has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * FIND ALL
   * @param {*} type
   * @param {*} options
   * @example
   * const data = await dataSequelizeStore.find({
   *    type: 'UserModel',
   *    options : { where: { id: '123' } },
   * })
   * @returns {Object}
   */
  this.find = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findAll(options)
      .then((docs) => docs)
      .catch((err) => {
        loggerFactory.error(`Find has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * CREATE
   * @param {*} type
   * @param {*} data
   * @example
   * const data = await dataSequelizeStore.create({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   * })
   * @returns {Object} data
   */
  this.create = function ({ type, data }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .create(data)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`Create has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * CREATE MANY
   * @param {*} type
   * @param {*} data
   * @param {*} options
   * @example
   * const data = await dataSequelizeStore.createMany({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   *    options: { where: { deleted: true } }
   * })
   * @returns {Object} data
   */
  this.createMany = function ({ type, data = {}, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .bulkCreate([data], options)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`Create many has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE
   * @param {*} type
   * @param {*} data
   * @param {*} options
   * @example
   * const data = await dataSequelizeStore.update({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   *    options: { where: { lastName: null } }
   * })
   * @returns {Object} data
   */
  this.update = function ({ type, data = {}, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .update(data, options)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`Update has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * DELETE
   * @param {*} type
   * @param {*} options
   * @example
   * const data = await dataSequelizeStore.deleted({
   *    type: 'UserModel',
   *    options: { where: { lastName: 'Doe' } }
   * })
   * @returns {Object} data
   */
  this.deleted = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .destroy(options)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`Deleted has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * FIND OR CREATE
   * @param {*} type
   * @param {*} options
   * @param {*} ref
   * @param {*} intermediateTable
   * @example
   * const [user, created] = await dataSequelizeStore.findCreate({
   *    type: 'UserModel',
   *    options : {
   *      where: { username: 'sdepold' },
   *      defaults: {
   *        job: 'Technical Lead JavaScript'
   *      }
   *    },
   *    ref: {
   *      belongsToMany: 'RoleModel' // many-to-many
   *    },
   *    intermediateTable: 'UserRoleModel'
   * })
   * @returns {Object} data
   */
  this.findCreate = async function ({ type, options = {}, ref = {}, intermediateTable = '' }) {
    loggerFactory.warn(`Model name: ${type}`);
    try {
      loggerFactory.warn(`func findCreate has been start`);
      const model = lookupModelSql(schemaModels, type, sequelize);
      await model.sync();

      if (!isEmpty(ref)) {
        if (Object.prototype.hasOwnProperty.call(ref, MANY_TO_MANY)) {
          if (!isEmpty(intermediateTable)) {
            await this.callRefManyToMany({ model, ref, intermediateTable });
          } else {
            throw errorManager.newError('IntermediateTableRequired', errorCodes);
          }
        }
      }

      const data = await model.findOrCreate(options);

      loggerFactory.warn(`func findCreate has been end`);

      return data;
    } catch (err) {
      loggerFactory.error(`func findCreate has error: ${err}`);
      return Promise.reject(err);
    }
  };
  /**
   * FIND AND COUNT ALL
   * @param {*} type
   * @param {*} options
   * @example
   * const { count, rows } = await dataSequelizeStore.findCountAll({
   *    type: 'UserModel',
   *    options : {
   *      where: {
   *        title: {
   *          [Op.like]: 'foo%'
   *         }
   *      },
   *     offset: 10,
   *    limit: 2
   *    },
   * })
   * @returns {Promise}
   */
  this.findCountAll = function ({ type, options = {} }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findAndCountAll(options)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`FindCountAll has error: ${err}`);
        return Promise.reject(err);
      });
  };
  /**
   * FIND BY PRIMARY KEY
   * @param {*} type
   * @param {*} pk
   * @example
   * const data = await dataSequelizeStore.findByPk({
   *    type: 'UserModel',
   *    pk : '123,
   * })
   * @returns {Object} data
   */
  this.findByPk = function ({ type, pk }) {
    loggerFactory.warn(`Model name: ${type}`);
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findByPk(pk)
      .then((result) => result)
      .catch((err) => {
        loggerFactory.error(`FindByPk has error: ${err}`);
        return Promise.reject(err);
      });
  };

  this.callRefManyToMany = async function ({ model, ref, intermediateTable }) {
    const typeBelongsToMany = get(ref, MANY_TO_MANY);
    const modelBelongsToMany = lookupModelSql(schemaModels, typeBelongsToMany, sequelize);
    await modelBelongsToMany.sync();
    model.belongsToMany(modelBelongsToMany, { through: intermediateTable });
    modelBelongsToMany.belongsToMany(model, { through: intermediateTable });
  };
}

exports = module.exports = new DataSequelizeStore();
exports.register = DataSequelizeStore;
