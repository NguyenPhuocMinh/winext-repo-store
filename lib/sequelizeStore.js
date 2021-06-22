'use strict';

const winext = require('winext');
const Sequelize = winext.require('sequelize');

function SequelizeStore(params = {}) {

  this.createConnection = function (hostMySql, portMySql, userMysql, passwordMysql, databaseMySql, dialect, pool) {

    const sequelize = new Sequelize(databaseMySql, userMysql, passwordMysql, {
      host: hostMySql,
      port: portMySql,
      dialect: dialect,
      pool: pool
    });

    return sequelize
  };

  this.Sequelize = Sequelize;
};

exports = module.exports = new SequelizeStore();
exports.register = SequelizeStore;