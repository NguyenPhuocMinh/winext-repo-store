'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  const hostMySql = get(mysqlConfig, 'host');
  const portMySql = get(mysqlConfig, 'port');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const databaseMySql = get(mysqlConfig, 'name');
  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  this.connectSequelize = function () {

    const sequelize = new Sequelize(databaseMySql && databaseMySql, userMysql && userMysql, passwordMysql && passwordMysql, {
      host: hostMySql && hostMySql,
      port: portMySql,
      dialect: dialect,
      pool: pool
    });

    return sequelize;
  }

  this.Sequelize = Sequelize;
  this.sequelize = this.connectSequelize();

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;