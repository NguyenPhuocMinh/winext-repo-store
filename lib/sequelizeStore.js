'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  const hostMySql = get(mysqlConfig, 'host');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const nameMySql = get(mysqlConfig, 'name');

  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  const sequelize = new Sequelize(nameMySql, userMysql, passwordMysql, {
    host: hostMySql,
    dialect: dialect,
    pool: pool
  });

  global.sequelize = sequelize;

  this.Sequelize = Sequelize;
  this.sequelize = sequelize;
};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;