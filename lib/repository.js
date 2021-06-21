'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const trigger = require('./trigger');
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
  const hostMySql = get(mysqlConfig, 'host');
  const portMySql = get(mysqlConfig, 'port');
  const userMysql = get(mysqlConfig, 'user');
  const passwordMysql = get(mysqlConfig, 'password');
  const nameMySql = get(mysqlConfig, 'name');

  const URL_MYSQL = `mysql://${hostMySql}:${portMySql}/${nameMySql}`;

  const createConnect = mysql.createConnection({
    host: hostMySql,
    port: portMySql,
    user: userMysql,
    password: passwordMysql,
    database: nameMySql
  })

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
  this.dataStore = trigger;
  /**
   * Start mysql
   */
  this.startupMySql = function () {
    if (enableMySql) {
      return new Promise((resolve, reject) => {
       const connect = createConnect.connect((err) => {
          if (!err) {
            loggerFactory.warn(`MySql connect complete ${URL_MYSQL}`, {
              requestId: `${requestId}`,
            });
          } else {
            loggerFactory.error(`MySql has error`,
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
          loggerFactory.error(`MySql has been error : ${err}`, {
            requestId: `${requestId}`
          });
          return Promise.reject(err)
        })
    } else {
      loggerFactory.info(`MySql not connected`, { requestId: `${requestId}` });
      return Promise.resolve('MySql not connected');
    }
  };
  /**
   * Down mysql
   */
  this.shutdownMySql = function () {
    if (enableMySql) {
      return new Promise(function (resolve, reject) {
        const disconnect = createConnect.end((err) => {
          if (err) {
            loggerFactory.error(`Disconnection mysql has error : ${err}`, {
              requestId: `${requestId}`
            });
            reject(err);
          }
        })
        loggerFactory.warn(`MySql ${URL_MYSQL} has been close`, {
          requestId: `${requestId}`
        });
        resolve(disconnect)
      })
        .then(() => {
          process.exit(0);
        })
        .catch(err => {
          loggerFactory.error(`Disconnection mysql has error : ${err}`, {
            requestId: `${requestId}`
          })
          return Promise.reject(err);
        })
    } else {
      loggerFactory.info(`Mysql not connected`, { requestId: `${requestId}` });
      return Promise.resolve('Mysql is not connected')
    }
  };
};

exports = module.exports = new Repository();
exports.register = Repository;
