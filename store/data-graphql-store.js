'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const fetch = winext.require('node-fetch');
const dotenv = winext.require('dotenv');
const { get, isEmpty } = lodash;
const { mutation } = require('gql-query-builder');

function DataGraphqlStore(params = {}) {
  const requestId = get(params, 'requestId');
  const loggerFactory = get(params, 'loggerFactory');
  const graphqlConfig = get(params, 'config.graphql');
  // config env
  dotenv.config();
  const protocol = process.env.PROTOCOL || 'http';
  const portServer = process.env.SERVER_PORT;
  const hostServer = process.env.SERVER_HOST;
  const pathGraphql = process.env.GRAPHQL_PATH || get(graphqlConfig, 'path', '/graphql');

  const endpoint = `${protocol}://${hostServer}:${portServer}${pathGraphql}`;

  this.queryData = async function ({ operationName, returnFields = [], variables = {} }) {
    try {
      loggerFactory.warn(`queryData has been start with`, {
        requestId: `${requestId}`,
        args: {
          operationName: operationName,
          fields: returnFields,
        },
      });
      const query = `
        query RootQuery {
         ${operationName} {
            ${returnFields}
          }
        }`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      loggerFactory.warn(`queryData has been end`, {
        requestId: `${requestId}`,
      });
      return !isEmpty(data.data) ? data.data : {};
    } catch (err) {
      loggerFactory.error(`queryData graphql has been error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };

  this.mutationData = async function ({ operationName, returnFields = [], dataFields, variables = {} }) {
    try {
      loggerFactory.warn(`mutationData has been start with`, {
        requestId: `${requestId}`,
        args: {
          operationName: operationName,
          variables: variables,
        },
      });
      const query = mutation({
        operation: 'thoughtCreate',
        variables: {
          name: 'Tyrion Lannister',
          thought: 'I drink and I know things.',
        },
        fields: ['id'],
      });
      // const mutation = `
      //   mutation RootMutation {
      //    ${operationName}(${dataFields}) {
      //       ${returnFields}
      //     }
      //   }`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query, variables: variables }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      loggerFactory.warn(`mutationData has been end`, {
        requestId: `${requestId}`,
      });
      return !isEmpty(data.data) ? data.data : {};
    } catch (err) {
      loggerFactory.error(`mutationData graphql has been error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };
}

exports = module.exports = new DataGraphqlStore();
exports.register = DataGraphqlStore;
