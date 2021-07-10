'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const dotenv = winext.require('dotenv');
const chalk = winext.require('chalk');
const dataStoreTrigger = require('./dataStoreTrigger');
const dataSequelizeTrigger = require('./dataSequelizeTrigger');
const { get, isEmpty } = lodash;
const { name, version } = require('../package.json');

function Repository(params = {}) {
  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const loggerTracer = get(params, 'loggerTracer');
  // config env
  dotenv.config();
  /**
   * Mongoose
   */
  mongoose.Promise = global.Promise;
  mongoose.set('debug', true);

  const mongooseConfig = get(params, 'config.mongoose');
  const enableMongoose = get(mongooseConfig, 'enable', false);
  const hostMongoose = process.env.MONGO_HOST || get(mongooseConfig, 'host');
  const portMongoose = process.env.MONGO_PORT || get(mongooseConfig, 'port');
  const nameMongoose = process.env.MONGO_DATABASE || get(mongooseConfig, 'name');

  const URL_MONGOOSE = `mongodb://${hostMongoose}:${portMongoose}/${nameMongoose}`;

  /**
   * MySQL
   */
  const mysqlConfig = get(params, 'config.mysql');
  const enableMySql = get(mysqlConfig, 'enable', false);
  const hostMySql = process.env.SQL_HOST || get(mysqlConfig, 'host', 'localhost');
  const portMySql = process.env.SQL_PORT || get(mysqlConfig, 'port', 3306);
  const userMysql = process.env.SQL_USER || get(mysqlConfig, 'user', 'root');
  const passwordMysql = process.env.SQL_PASSWORD || get(mysqlConfig, 'password', 'root');
  const databaseMySql = process.env.SQL_DATABASE || get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', 'mysql');

  const URL_MYSQL = `${dialect}://${userMysql}:${passwordMysql}@${hostMySql}:${portMySql}/${databaseMySql}`;

  let createConnection = null;
  if (enableMySql && !isEmpty(mysqlConfig)) {
    createConnection = mysql.createConnection({
      host: hostMySql,
      port: portMySql,
      user: userMysql,
      password: passwordMysql,
      database: databaseMySql
    });
  }
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
              requestId: `${requestId}`
            });
            loggerTracer.info(chalk.blue(`Load mongoose by ${name}-${version} successfully!`));
          } else {
            loggerFactory.error(`Mongoose has error`,
              {
                requestId: `${requestId}`,
                args: err
              }
            );
            reject(err);
          }
        });
        resolve(connect);
      })
        .then(info => {
          return info;
        })
        .catch(err => {
          loggerFactory.error(`Mongoose has been error : ${err}`, {
            requestId: `${requestId}`
          });
          return Promise.reject(err);
        });
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
        });
        loggerFactory.warn(`Mongoose ${URL_MONGOOSE} has been close`, {
          requestId: `${requestId}`
        });
        resolve(disconnect);
      })
        .then(() => {
          process.exit(0);
        })
        .catch(err => {
          loggerFactory.error(`Disconnection mongoose has error : ${err}`, {
            requestId: `${requestId}`
          });
          return Promise.reject(err);
        });
    } else {
      loggerFactory.info(`Mongoose not connected`, { requestId: `${requestId}` });
      return Promise.resolve('Mongoose is not connected');
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
      if (enableMySql || !isEmpty(mysqlConfig)) {
        await createConnection.connect(err => {
          if (!err) {
            loggerFactory.debug(`MySql has been connect successfully`, {
              requestId: `${requestId}`
            });
            loggerTracer.info(chalk.blue(`Load mysql by ${name}-${version} successfully!`));
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
          if (!err) {
            loggerFactory.debug(`Not Connection Sequelize has been successfully : ${URL_MYSQL}`, {
              requestId: `${requestId}`
            });
            loggerTracer.info(chalk.blue(`Load mysql by ${name}-${version} successfully!`));
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
      if (!enableMySql || isEmpty(mysqlConfig)) {
        return;
      }
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
      loggerFactory.error(`Sequelize has been close has error : ${err}`, {
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
}

exports = module.exports = new Repository();
exports.register = Repository;
