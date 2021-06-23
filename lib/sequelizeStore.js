'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');

  this.sequelize = async function (databaseMySql, userMysql, passwordMysql, hostMySql, portMySql, dialect, pool) {

    loggerFactory.info(`sequelize has been start`, {
      requestId: `${requestId}`,
    })

    try {
      const sequelizeConnect = new Sequelize(databaseMySql, userMysql, passwordMysql, {
        host: hostMySql,
        port: portMySql,
        dialect: dialect,
        pool: pool
      });

      loggerFactory.info(`sequelize has been complete`, {
        requestId: `${requestId}`,
      })

      return sequelizeConnect;

    } catch (err) {
      loggerFactory.error(`sequelize has error : ${err}`, {
        requestId: `${requestId}`,
        args: { err }
      })
      return Promise.reject(err);
    }
  }

  this.Sequelize = Sequelize;

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;