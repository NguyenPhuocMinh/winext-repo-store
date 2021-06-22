'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  const enable = get(mysqlConfig, 'enable', false);
  const hostMySql = enable ? get(mysqlConfig, 'host') : 'localhost';
  const portMySql = enable ? get(mysqlConfig, 'port') : 3306;
  const userMysql = enable ? get(mysqlConfig, 'user') : 'root';
  const passwordMysql = enable ? get(mysqlConfig, 'password') : 'root';
  const databaseMySql = enable ? get(mysqlConfig, 'name') : 'database';
  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  const createConnection = createConnectSequelize(
    databaseMySql,
    userMysql,
    passwordMysql,
    hostMySql,
    portMySql,
    dialect,
    pool
  );

  this.sequelize = createConnection;

  this.Sequelize = Sequelize;

};

function createConnectSequelize(
  databaseMySql,
  userMysql,
  passwordMysql,
  hostMySql,
  portMySql,
  dialect,
  pool
) {

  const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
    pool: pool
  });

  return sequelize;
}

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;