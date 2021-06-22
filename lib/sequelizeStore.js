'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const Sequelize = winext.require('sequelize');

function SequelizeStore(params = {}) {
  console.log("🚀 ~ file: sequelizeStore.js ~ line 7 ~ SequelizeStore ~ params", params)

  const mysqlConfig = get(params, 'config.mysql');
  const hostMySql = get(mysqlConfig, 'host');
  const portMySql = get(mysqlConfig, 'port');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const databaseMySql = get(mysqlConfig, 'name');
  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  this.connectSequelize = async function () {
    try {
      const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
        host: hostMySql,
        port: portMySql,
        dialect: dialect,
        pool: pool
      });

      return sequelize;

    } catch (err) {
      return Promise.reject(err);
    }
  }

  this.Sequelize = Sequelize;
  this.sequelize = this.connectSequelize();
};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;