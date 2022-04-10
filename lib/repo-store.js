'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const dotenv = winext.require('dotenv');
const chalk = winext.require('chalk');
const dataMongoStore = require('../store/data-mongo-store');
const dataSequelizeStore = require('../store/data-sequelize-store');
const { get, isEmpty } = lodash;

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
  const userMongoose = process.env.MONGO_USER || get(mongooseConfig, 'user');
  const passwordMongoose = process.env.MONGO_PASSWORD || get(mongooseConfig, 'password');
  const nameMongoose = process.env.MONGO_DATABASE || get(mongooseConfig, 'name');

  const URL_MONGOOSE = enableMongoose
    ? `mongodb://${userMongoose}:${passwordMongoose}@${hostMongoose}:${portMongoose}/${nameMongoose}`
    : `mongodb://${hostMongoose}:${portMongoose}/${nameMongoose}`;

  /**
   * MySQL
   */
  const mysqlConfig = get(params, 'config.mysql');
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
  this.startMongo = async function () {
    try {
      if (isEmpty(mongooseConfig)) {
        loggerTracer.debug(chalk.blue.bold('Not found config mongoose!'));
        return;
      }
      await mongoose.connect(
        URL_MONGOOSE,
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (!err) {
            loggerFactory.info(`Mongoose connect complete ${URL_MONGOOSE}`, {
              requestId: `${requestId}`,
            });
          }
        }
      );
    } catch (err) {
      loggerFactory.error(`Start mongo has been error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };
  /**
   * Stop Mongo
   */
  this.stopMongo = async function () {
    try {
      if (isEmpty(mongooseConfig)) {
        loggerTracer.debug(chalk.blue.bold('Not found config mongoose'));
      }
      await mongoose.connection.close((err) => {
        if (!err) {
          loggerFactory.warn(`Mongo has been close`, {
            requestId: `${requestId}`,
          });
        }
      });
    } catch (err) {
      loggerFactory.error(`Stop mongo has error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };
  /**
   * Data Mongo Store
   */
  this.dataMongoStore = dataMongoStore;
  /**
   * Start Mysql
   */
  this.startMySql = async function () {
    try {
      if (isEmpty(mysqlConfig)) {
        loggerTracer.debug(chalk.blue.bold(`Not found mysql config!`));
      }
      await createConnection.connect((err) => {
        if (!err) {
          loggerFactory.info(`MySql connect complete ${URL_MYSQL}`, {
            requestId: `${requestId}`,
          });
        }
      });
      await dataSequelizeStore.sequelize.authenticate().then((err) => {
        if (!err) {
          loggerFactory.info(`Connection Sequelize has been successfully`, {
            requestId: `${requestId}`,
          });
        }
      });
    } catch (err) {
      loggerFactory.error(`Start mysql has been error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };
  /**
   * Stop Mysql
   */
  this.stopMySql = async function () {
    try {
      if (isEmpty(mysqlConfig)) {
        loggerTracer.debug(chalk.blue.bold(`Not found mysql config!`));
      }
      await createConnection.end((err) => {
        if (!err) {
          loggerFactory.info(`MySql ${URL_MYSQL} has been close`, {
            requestId: `${requestId}`,
          });
        }
      });
      await dataSequelizeStore.sequelize.close((err) => {
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
   * Data Sequelize Store
   */
  this.dataSequelizeStore = dataSequelizeStore;
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