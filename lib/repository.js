'use strict';

const winrow = require('winrow');
const { mongoose, lodash } = winrow;
const dataStore = require('./dataStore');
const loggingFactory = require('winrow-logger');
const { get } = lodash;

function Repository() {
  // connect mongoose
  this.connect = function (sandbox) {
    const enable = get(sandbox, 'application.enable');
    const database_server = get(sandbox, 'application.bridge.database_server');
    const database_local = get(sandbox, 'application.bridge.database_local');
    let host = get(database_server, 'host');
    let port = get(database_server, 'port');
    let name = get(database_server, 'name');
    if (!enable) {
      host = get(database_local, 'host');
      port = get(database_local, 'port');
      name = get(database_local, 'name');
    }
    const db_url = `mongodb://${host}:${port}/${name}`;
    return new Promise((resolve, reject) => {
      const connect = mongoose.connect(db_url, { useNewUrlParser: true }, (err) => {
        if (!err) {
          console.info(`Connected to the ${db_url}`);
        } else {
          console.info(`Database is not connected`, err);
          reject(err);
        }
      })
      resolve(connect);
    })
      .then(info => {
        return info;
      })
      .catch(err => {
        loggingFactory.error('error', JSON.stringify(err, null, 1));
        return Promise.reject(err)
      })
  };
  // get dataStore
  this.dataStore = dataStore;

};

module.exports = new Repository();