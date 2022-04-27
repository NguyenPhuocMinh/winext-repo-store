'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const { graphql } = winext.require('graphql');
const { get } = lodash;

function DataGraphqlStore(params = {}) {
  const schema = get(params, 'modelGraphqlDescriptor', {});

  this.queryData = async function ({ type }) {
    try {
      const data = await graphql({ schema: schema, source: type });
      console.log('🚀 ~ file: data-graphql-store.js ~ line 15 ~ data', data);
      return 'data';
    } catch (err) {
      return Promise.reject(err);
    }
  };

  this.mutationData = async function ({ operationName, variables = {} }) {};
}

exports = module.exports = new DataGraphqlStore();
exports.register = DataGraphqlStore;
