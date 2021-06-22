'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params) {
  params = params || {};
  console.log("🚀 ~ file: sequelizeStore.js ~ line 10 ~ SequelizeStore ~ params", params)

  this.createConnection = function (databaseMySql, userMysql, passwordMysql, hostMySql, portMySql, dialect, pool) {

    const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
      host: hostMySql,
      port: portMySql,
      dialect: dialect,
      pool: pool
    });

    return sequelize;
  }

  this.sequelize = this.createConnection(databaseMySql, userMysql, passwordMysql, hostMySql, portMySql, dialect, pool);

  this.Sequelize = Sequelize;

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;