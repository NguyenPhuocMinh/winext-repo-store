'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const Sequelize = winext.require('sequelize');
const { get } = lodash;

function SequelizeStore(params = {}) {
  params = params || {};

  this.createConnectSequelize = function (databaseMySql, userMysql, passwordMysql, hostMySql, portMySql, dialect, pool) {

    const database = databaseMySql && databaseMySql;
    const user = userMysql && userMysql;
    const password = passwordMysql && passwordMysql
    const host = hostMySql && hostMySql;
    const port = portMySql && portMySql;
    const dialectOpt = dialect && dialect;
    const poolOpt = pool && pool;

    const sequelizeConnect = new Sequelize(database, user, password, {
      host: host,
      port: port,
      dialect: dialectOpt,
      pool: poolOpt
    });

    return sequelizeConnect;

  }

  this.sequelize = this.createConnectSequelize();

  this.Sequelize = Sequelize;

};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;