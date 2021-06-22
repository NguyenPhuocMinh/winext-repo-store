'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const dataStoreTrigger = require('./dataStoreTrigger');
const dataSequelizeTrigger = require('./dataSequelizeTrigger');
const sequelizeStore = require('./sequelizeStore');
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
        await sequelizeStore.sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } else {
        await sequelizeStore.sequelize.close();
        console.log('Not Connection has been established successfully.');
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };
  /**
   * Down mysql
   */
  this.shutdownMySql = function () {
    try {
      await sequelizeStore.sequelize.close();
      console.log('Not Connection has been established successfully.');
    } catch (err) {
      return Promise.reject(err);
    }
  };
  /**
   * DataSequelize
   */
  this.dataSequelize = dataSequelizeTrigger;
  /**
   * sequelizeStore
   */
  this.sequelizeStore = sequelizeStore;
  /**
   * mongoose
   */
  this.mongoose = mongoose;
};

exports = module.exports = new Repository();
exports.register = Repository;
