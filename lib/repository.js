'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const trigger = require('./trigger');
const { get } = lodash;

function Repository(params = {}) {

  // global Promise
  mongoose.Promise = global.Promise;
  mongoose.set("debug", true);

  const mongooseConfig = get(params, 'config.mongoose');
  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');

  const enableMongoose = get(mongooseConfig, 'enable', false);
  const hostMongoose = get(mongooseConfig, 'host');
  const portMongoose = get(mongooseConfig, 'port');
  const nameMongoose = get(mongooseConfig, 'name');

  const URL_MONGOOSE = `mongodb://${hostMongoose}:${portMongoose}/${nameMongoose}`;

  // Connect mongoose
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
  // Disconnect mongoose
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
  }

  this.dataStore = trigger;

};

exports = module.exports = new Repository();
exports.register = Repository;
