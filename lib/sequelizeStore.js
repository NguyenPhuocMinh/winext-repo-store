'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {
  params = params || {};
  console.log("🚀 ~ file: sequelizeStore.js ~ line 11 ~ SequelizeStore ~ params", params)

  const hostMySql = get(mysqlConfig, 'host', 'localhost');
  const portMySql = get(mysqlConfig, 'port', 3306);
  const userMysql = get(mysqlConfig, 'user', 'root');
  const passwordMysql = get(mysqlConfig, 'password', 'root');
  const databaseMySql = get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', 'mysql');
  const pool = get(sequelizeOptions, 'pool', {});

  this.createConnectSequelize = function () {

    const sequelizeConnect = new Sequelize(databaseMySql, userMysql, passwordMysql, {
      host: hostMySql,
      port: portMySql,
      dialect: dialect,
      pool: pool
    });

    return sequelizeConnect;

  }

  this.sequelize = this.createConnectSequelize();

  this.Sequelize = Sequelize;

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;