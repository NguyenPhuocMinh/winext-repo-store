'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const { Sequelize } = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {

  const mysqlConfig = get(params, 'config.mysql');
  console.log("🚀 ~ file: sequelizeStore.js ~ line 11 ~ SequelizeStore ~ mysqlConfig", mysqlConfig)
  const hostMySql = get(mysqlConfig, 'host');
  console.log("🚀 ~ file: sequelizeStore.js ~ line 13 ~ SequelizeStore ~ hostMySql", hostMySql)
  const portMySql = get(mysqlConfig, 'port');
  console.log("🚀 ~ file: sequelizeStore.js ~ line 14 ~ SequelizeStore ~ portMySql", portMySql)
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const databaseMySql = get(mysqlConfig, 'name');

  const sequelizeOtp = get(mysqlConfig, 'sequelizeOtp');
  const dialect = get(sequelizeOtp, 'dialect', 'mysql');
  const pool = get(sequelizeOtp, 'pool', {});

  // const sequelize = createConnection({
  //   database: nameMySql,
  //   user: userMysql,
  //   password: passwordMysql,
  //   host: hostMySql,
  //   port: portMySql,
  //   dialect: dialect,
  // });

  const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
    host: hostMySql,
    port: portMySql,
    dialect: dialect,
    pool: pool
  })

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