'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const fetch = winext.require('node-fetch');
const { get } = lodash;

function DataGraphqlStore(params = {}) {
  const modelDescriptor = get(params, 'modelDescriptor', {});

  this.queryData = async function ({ operationName, fields = [] }) {
    try {
      const query = `
        query RootQuery {
         ${operationName} {
            ${fields}
          }
        }`;
      const response = fetch('http://localhost:7979/graphql', {
        method: 'POST',
        body: JSON.stringify({ query, variables: {} }),
      });
      const data = await response.text();
      console.log("🚀 ~ file: data-graphql-store.js ~ line 25 ~ data", data)
      return 'data';
    } catch (err) {
      return Promise.reject(err);
    }
  };

  this.mutationData = async function ({ operationName, variables = {} }) {};
}

exports = module.exports = new DataGraphqlStore();
exports.register = DataGraphqlStore;
