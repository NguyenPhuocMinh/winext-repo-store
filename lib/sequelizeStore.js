'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const { Sequelize } = winext.require('sequelize');
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

  const sequelize = createConnection({
    database: databaseMySql,
    user: userMysql,
    password: passwordMysql,
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
    pool: pool
  });

  this.Sequelize = Sequelize;
  this.sequelize = sequelize;
};

function createConnection({ database, user, password, host, port, dialect }) {
  const connectionURI = `${dialect}://${user}:${password}@${host}:${port}/${database}`;
  const sequelize = new Sequelize(connectionURI);

  return sequelize;
}

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;