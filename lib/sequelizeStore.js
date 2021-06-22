'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get, isEmpty } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  const enable = get(mysqlConfig, 'enable', false);
  const hostMySql = get(mysqlConfig, 'host');
  const portMySql = get(mysqlConfig, 'port');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const databaseMySql = get(mysqlConfig, 'name');
  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  let sequelize = null;

  if (enable && !isEmpty(databaseMySql) && !isEmpty(userMysql) && !isEmpty(passwordMysql)) {
    sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
      host: hostMySql,
      port: portMySql,
      dialect: dialect,
      pool: pool
    });
  }

  this.Sequelize = Sequelize;
  this.sequelize = sequelize

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;