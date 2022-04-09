'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const dotenv = winext.require('dotenv');
const chalk = winext.require('chalk');
const dataStoreTrigger = require('../store/dataStoreTrigger');
const dataSequelizeTrigger = require('../store/dataSequelizeTrigger');
const { get, isEmpty } = lodash;
const { name, version } = require('../package.json');

function RepoStore(params = {}) {
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

  const createConnection = mysql.createConnection({
    host: hostMySql,
    port: portMySql,
    user: userMysql,
    password: passwordMysql,
    database: databaseMySql,
  });

  /**
   * Start Mongo
   */
  this.startMongo = function () {
    if (enableMongoose) {
      return new Promise((resolve, reject) => {
        const connect = mongoose.connect(
          URL_MONGOOSE,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
          (err) => {
            if (!err) {
              loggerTracer.info(chalk.green.bold(`Load mongoose by ${name}-${version} successfully!`));
              loggerFactory.info(`Mongoose connect complete ${URL_MONGOOSE}`, {
                requestId: `${requestId}`,
              });
            } else {
              loggerFactory.error(`Mongoose has error`, {
                requestId: `${requestId}`,
                args: err,
              });
              reject(err);
            }
          }
        );
        resolve(connect);
      })
        .then((info) => {
          return info;
        })
        .catch((err) => {
          loggerFactory.error(`Mongoose has been error: ${err}`, {
            requestId: `${requestId}`,
          });
          return Promise.reject(err);
        });
    } else {
      loggerFactory.info(`Mongoose not enable`, { requestId: `${requestId}` });
      return Promise.resolve('Mongoose not connected');
    }
  };
  /**
   * Stop Mongo
   */
  this.stopMongo = function () {
    if (enableMongoose) {
      return (
        new Promise(function (resolve, reject) {
          const disconnect = mongoose.connection.close((err) => {
            if (err) {
              loggerFactory.error(`Stop mongoose has error: ${err}`, {
                requestId: `${requestId}`,
              });
              reject(err);
            }
          });
          loggerFactory.info(`Mongoose ${URL_MONGOOSE} has been close`, {
            requestId: `${requestId}`,
          });
          resolve(disconnect);
        })
          // .then(() => {
          //   process.exit(0);
          // })
          .catch((err) => {
            loggerFactory.error(`Disconnection mongoose has error : ${err}`, {
              requestId: `${requestId}`,
            });
            return Promise.reject(err);
          })
      );
    } else {
      loggerFactory.info(`Mongoose is not enable!`, { requestId: `${requestId}` });
      return Promise.resolve('Mongoose is not enable!');
    }
  };
  /**
   * DataStore
   */
  this.dataStore = dataStoreTrigger;
  /**
   * Start Mysql
   */
  this.startMySql = async function () {
    try {
      if (!isEmpty(mysqlConfig) && enableMySql) {
        await createConnection.connect((err) => {
          if (!err) {
            loggerTracer.info(chalk.green.bold(`Load mysql by ${name}-${version} successfully!`));
            loggerFactory.info(`MySql connect complete ${URL_MYSQL}`, {
              requestId: `${requestId}`,
            });
          }
        });
        await dataSequelizeTrigger.sequelize.authenticate().then((err) => {
          if (!err) {
            loggerFactory.info(`Connection Sequelize has been successfully`, {
              requestId: `${requestId}`,
            });
          }
        });
      } else {
        loggerTracer.warn(chalk.yellow.bold(`Load mysql fail!`));
      }
    } catch (err) {
      loggerFactory.error(`Start mysql has been error: ${err}`, {
        requestId: `${requestId}`,
        args: err,
      });
      return Promise.reject(err);
    }
  };
  /**
   * Stop Mysql
   */
  this.stopMySql = async function () {
    try {
      if (!enableMySql || isEmpty(mysqlConfig)) {
        loggerTracer.warn(chalk.yellow.bold(`Mysql is not enable!`));
        return Promise.resolve('Mysql is not enable!');
      }
      await createConnection.end((err) => {
        if (!err) {
          loggerFactory.info(`MySql ${URL_MYSQL} has been close`, {
            requestId: `${requestId}`,
          });
        }
      });
      await dataSequelizeTrigger.sequelize.close((err) => {
        if (!err) {
          loggerFactory.info(`Sequelize has been close`, {
            requestId: `${requestId}`,
          });
        }
      });
    } catch (err) {
      loggerFactory.error(`Stop mysql close has error: ${err}`, {
        requestId: `${requestId}`,
        args: err,
      });
      return Promise.reject(err);
    }
  };
  /**
   * DataSequelize
   */
  this.dataSequelize = dataSequelizeTrigger;
  /**
   * Mongoose
   */
  this.mongoose = mongoose;
  /**
   * Connection mysql
   */
  this.createConnection = createConnection;
}

exports = module.exports = new RepoStore();
exports.register = RepoStore;
