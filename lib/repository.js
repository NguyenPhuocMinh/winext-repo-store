'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const dataStoreTrigger = require('./dataStoreTrigger');
const dataSequelizeTrigger = require('./dataSequelizeTrigger');
const { get } = lodash;

function Repository(params = {}) {

  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');

  /**
   * Mongoose
   */
  mongoose.Promise = global.Promise;
  mongoose.set("debug", true);

  const mongooseConfig = get(params, 'config.mongoose');
  const enableMongoose = get(mongooseConfig, 'enable', false);
  const hostMongoose = get(mongooseConfig, 'host');
  const portMongoose = get(mongooseConfig, 'port');
  const nameMongoose = get(mongooseConfig, 'name');

  const URL_MONGOOSE = `mongodb://${hostMongoose}:${portMongoose}/${nameMongoose}`;

  /**
   * MySQL
   */

  const mysqlConfig = get(params, 'config.mysql');
  const enableMySql = get(mysqlConfig, 'enable', false);
  const hostMySql = get(mysqlConfig, 'host', 'localhost');
  const portMySql = get(mysqlConfig, 'port', 3306);
  const userMysql = get(mysqlConfig, 'user', 'root');
  const passwordMysql = get(mysqlConfig, 'password', 'root');
  const databaseMySql = get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', 'mysql');

  const URL_MYSQL = `${dialect}://${userMysql}:${passwordMysql}@${hostMySql}:${portMySql}/${databaseMySql}`;

  const createConnection = mysql.createConnection({
    host: hostMySql,
    port: portMySql,
    user: userMysql,
    password: passwordMysql,
    database: databaseMySql
  });
  /**
   * Start mongoose
   */
  this.startupMongoose = function () {
    if (enableMongoose) {
      return new Promise((resolve, reject) => {
        const connect = mongoose.connect(URL_MONGOOSE, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }, (err) => {
          if (!err) {
            loggerFactory.warn(`Mongoose connect complete ${URL_MONGOOSE}`, {
              requestId: `${requestId}`,
            });
          } else {
            loggerFactory.error(`Mongoose has error`,
              {
                requestId: `${requestId}`,
                args: err
              },
            )
            reject(err);
          }
        })
        resolve(connect);
      })
        .then(info => {
          return info;
        })
        .catch(err => {
          loggerFactory.error(`Mongoose has been error : ${err}`, {
            requestId: `${requestId}`
          });
          return Promise.reject(err)
        })
    } else {
      loggerFactory.info(`Mongoose not connected`, { requestId: `${requestId}` });
      return Promise.resolve('Mongoose not connected');
    }
  };
  /**
   * Down mongoose
   */
  this.shutdownMongoose = function () {
    if (enableMongoose) {
      return new Promise(function (resolve, reject) {
        const disconnect = mongoose.connection.close((err) => {
          if (err) {
            loggerFactory.error(`Disconnection mongoose has error : ${err}`, {
              requestId: `${requestId}`
            });
            reject(err);
          }
        })
        loggerFactory.warn(`Mongoose ${URL_MONGOOSE} has been close`, {
          requestId: `${requestId}`
        });
        resolve(disconnect)
      })
        .then(() => {
          process.exit(0);
        })
        .catch(err => {
          loggerFactory.error(`Disconnection mongoose has error : ${err}`, {
            requestId: `${requestId}`
          })
          return Promise.reject(err);
        })
    } else {
      loggerFactory.info(`Mongoose not connected`, { requestId: `${requestId}` });
      return Promise.resolve('Mongoose is not connected')
    }
  };
  /**
   * DataStore
   */
  this.dataStore = dataStoreTrigger;
  /**
   * Start mysql
   */
  this.startupMySql = async function () {
    try {
      if (enableMySql) {
        await createConnection.connect(err => {
          if (!err) {
            loggerFactory.debug(`MySql has been connect successfully`, {
              requestId: `${requestId}`
            });
          }
        });
        await dataSequelizeTrigger.sequelize.authenticate()
          .then(err => {
            if (!err) {
              loggerFactory.debug(`Connection Sequelize been successfully : ${URL_MYSQL}`, {
                requestId: `${requestId}`
              });
            }
          });
      } else {
        loggerFactory.debug(`Not Connection Sequelize has been successfully : ${URL_MYSQL}`, {
          requestId: `${requestId}`
        });
        await createConnection.end();
        await dataSequelizeTrigger.sequelize.close(err => {
          if(!err) {
            loggerFactory.debug(`Not Connection Sequelize has been successfully : ${URL_MYSQL}`, {
              requestId: `${requestId}`
            });
          }
        });
      }
    } catch (err) {
      loggerFactory.error(`StartupMySql has been error : ${err}`, {
        requestId: `${requestId}`,
        args: { err }
      });
      return Promise.reject(err);
    }
  };
  /**
   * Down mysql
   */
  this.shutdownMySql = async function () {
    try {
      await createConnection.end(err => {
        if (!err) {
          loggerFactory.debug(`MySql has been close`, {
            requestId: `${requestId}`
          });
        }
      });
      await dataSequelizeTrigger.sequelize.close(err => {
        if (!err) {
          loggerFactory.debug(`Sequelize has been close`, {
            requestId: `${requestId}`
          });
        }
      });
    } catch (err) {
      loggerFactory.debug(`Sequelize has been close has error : ${err}`, {
        requestId: `${requestId}`,
        args: { err }
      });
      return Promise.reject(err);
    }
  };
  /**
   * DataSequelize
   */
  this.dataSequelize = dataSequelizeTrigger;
  /**
   * mongoose
   */
  this.mongoose = mongoose;
  /**
   * connection mysql
   */
  this.createConnection = createConnection;
};

exports = module.exports = new Repository();
exports.register = Repository;