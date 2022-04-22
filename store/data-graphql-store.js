'use strict';

const winext = require('winext');

function DataGraphqlStore(params = {}) {
  this.data = function () {
    return 'data';
  };
}

exports = module.exports = new DataGraphqlStore();
exports.register = DataGraphqlStore;
