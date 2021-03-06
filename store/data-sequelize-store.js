'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const errorManager = winext.require('winext-error-manager');
const lookupModelSql = require('../utils/lookup-model-sql-util');
const errorCodes = require('../config/errorCodes');
const { get, isEmpty, map } = lodash;

const options = require('../conf/options');
const profiles = require('../conf/profiles');

function DataSequelizeStore(params = {}) {
  const loggerTracer = get(params, 'loggerTracer');
  const modelDescriptor = get(params, 'modelDescriptor', []);

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

  const manyToMany = options.associationsOptions.many_to_many;

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
   * @argument {*} type
   * @argument {*} options
   * @example
   * const data = await dataSequelizeStore.findOne({
   *    type: 'UserModel',
   *    options : { where: { id: '123' } },
   * })
   * @returns {Object} data
   */
  this.findOne = function ({ type, options = {} }) {
    loggerTracer.debug(`Function findOne has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findOne(options)
      .then((doc) => doc)
      .catch((err) => {
        loggerTracer.error(`Function findOne has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * COUNT
   * @argument {*} type
   * @argument {*} options
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
    loggerTracer.warn(`Function count has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .count(options)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function count has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * FIND ALL
   * @argument {*} type
   * @argument {*} options
   * @example
   * const data = await dataSequelizeStore.find({
   *    type: 'UserModel',
   *    options : { where: { id: '123' } },
   * })
   * @returns {Object}
   */
  this.find = function ({ type, options = {} }) {
    loggerTracer.warn(`Function find has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findAll(options)
      .then((docs) => docs)
      .catch((err) => {
        loggerTracer.error(`Function find has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * CREATE
   * @argument {*} type
   * @argument {*} data
   * @example
   * const data = await dataSequelizeStore.create({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   * })
   * @returns {Object} data
   */
  this.create = function ({ type, data }) {
    loggerTracer.warn(`Function create has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .create(data)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function create has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * CREATE MANY
   * @argument {*} type
   * @argument {*} data
   * @argument {*} options
   * @example
   * const data = await dataSequelizeStore.createMany({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   *    options: { where: { deleted: true } }
   * })
   * @returns {Object} data
   */
  this.createMany = function ({ type, data = {}, options = {} }) {
    loggerTracer.warn(`Function createMany has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .bulkCreate([data], options)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function createMany has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * UPDATE
   * @argument {*} type
   * @argument {*} data
   * @argument {*} options
   * @example
   * const data = await dataSequelizeStore.update({
   *    type: 'UserModel',
   *    data : { firstName: 'John', lastName: 'Doe' },
   *    options: { where: { lastName: null } }
   * })
   * @returns {Object} data
   */
  this.update = function ({ type, data = {}, options = {} }) {
    loggerTracer.warn(`Function update has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .update(data, options)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function update has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * DELETE
   * @argument {*} type
   * @argument {*} options
   * @example
   * const data = await dataSequelizeStore.deleted({
   *    type: 'UserModel',
   *    options: { where: { lastName: 'Doe' } }
   * })
   * @returns {Object} data
   */
  this.deleted = function ({ type, options = {} }) {
    loggerTracer.warn(`Function deleted has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .destroy(options)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function deleted has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * FIND OR CREATE
   * @argument {*} type
   * @argument {*} options
   * @argument {*} ref
   * @argument {*} intermediateTable
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
    loggerTracer.warn(`Function findCreate has been start with model name`, {
      args: `[${type}]`,
    });
    try {
      const model = lookupModelSql(schemaModels, type, sequelize);
      await model.sync();

      if (!isEmpty(ref)) {
        if (Object.prototype.hasOwnProperty.call(ref, manyToMany)) {
          if (!isEmpty(intermediateTable)) {
            await this.callRefManyToMany({ model, ref, intermediateTable });
          } else {
            throw errorManager.newError('IntermediateTableRequired', errorCodes);
          }
        }
      }

      const data = await model.findOrCreate(options);

      loggerTracer.warn(`Function findCreate has been end`);

      return data;
    } catch (err) {
      loggerTracer.error(`Function findCreate has error`, {
        args: err,
      });
      return Promise.reject(err);
    }
  };
  /**
   * FIND AND COUNT ALL
   * @argument {*} type
   * @argument {*} options
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
    loggerTracer.warn(`Function findCountAll has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findAndCountAll(options)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function findCountAll has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };
  /**
   * FIND BY PRIMARY KEY
   * @argument {*} type
   * @argument {*} pk
   * @example
   * const data = await dataSequelizeStore.findByPk({
   *    type: 'UserModel',
   *    pk : '123,
   * })
   * @returns {Object} data
   */
  this.findByPk = function ({ type, pk }) {
    loggerTracer.warn(`Function findByPk has been start with model name`, {
      args: `[${type}]`,
    });
    const model = lookupModelSql(schemaModels, type, sequelize);
    return model
      .findByPk(pk)
      .then((result) => result)
      .catch((err) => {
        loggerTracer.error(`Function findByPk has error`, {
          args: err,
        });
        return Promise.reject(err);
      });
  };

  this.callRefManyToMany = async function ({ model, ref, intermediateTable }) {
    try {
      loggerTracer.warn(`Function callRefManyToMany has been start with model name`, {
        args: {
          model: model,
          ref: ref,
          intermediateTable: intermediateTable,
        },
      });
      const typeBelongsToMany = get(ref, manyToMany);
      const modelBelongsToMany = lookupModelSql(schemaModels, typeBelongsToMany, sequelize);
      await modelBelongsToMany.sync();
      model.belongsToMany(modelBelongsToMany, { through: intermediateTable });
      modelBelongsToMany.belongsToMany(model, { through: intermediateTable });
      loggerTracer.warn(`Function callRefManyToMany has been end`);
    } catch (err) {
      loggerTracer.error(`Function callRefManyToMany has error`, {
        args: err,
      });
      return Promise.reject(err);
    }
  };
}

exports = module.exports = new DataSequelizeStore();
exports.register = DataSequelizeStore;
