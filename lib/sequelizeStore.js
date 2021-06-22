'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  console.log("🚀 ~ file: sequelizeStore.js ~ line 11 ~ SequelizeStore ~ mysqlConfig", mysqlConfig)
  const hostMySql = get(mysqlConfig, 'host');
  const portMySql = get(mysqlConfig, 'port');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const nameMySql = get(mysqlConfig, 'name');

  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  const sequelize = createConnection({
    database: nameMySql,
    username: userMysql,
    password: passwordMysql,
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
  });

  global.sequelize = sequelize;

  this.Sequelize = Sequelize;
  this.sequelize = sequelize;
};

function createConnection({ database, username, password, host, port, dialect }) {
  const connectionURI = `${dialect}://${username}:${password}@${host}:${port}/${database}`;
  console.log("🚀 ~ file: sequelizeStore.js ~ line 40 ~ createConnection ~ connectionURI", connectionURI)
  const sequelize = new Sequelize(connectionURI);

  return sequelize;
}

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;