'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const fetch = winext.require('node-fetch');
const dotenv = winext.require('dotenv');
const { get } = lodash;
const { query, mutation } = require('gql-query-builder');

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

  /**
   * Query graphql data
   * @param {string} operationName
   * @param {string} returnFields
   * @param {string} variables
   * @see https://www.npmjs.com/package/gql-query-builder
   * @example
   * const variables = {
   *    name: { value: "Tyrion Lannister", required: true },
   * }
   * const query = await queryData({ operationName: 'author', returnFields = ['id', 'name'], variables })
   * @returns {Object} data
   */
  this.queryData = async function ({ operationName, returnFields = [], variables = {} }) {
    try {
      loggerFactory.warn(`queryData has been start with`, {
        requestId: `${requestId}`,
        args: {
          operationName: operationName,
          fields: returnFields,
        },
      });

      const queryBuilder = query({
        operation: operationName,
        variables: variables,
        fields: returnFields,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: queryBuilder.query, variables: queryBuilder.variables }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      loggerFactory.warn(`queryData has been end`, {
        requestId: `${requestId}`,
      });
      return data;
    } catch (err) {
      loggerFactory.error(`queryData graphql has been error: ${err}`, {
        requestId: `${requestId}`,
      });
      return Promise.reject(err);
    }
  };

  /**
   * Mutation graphql data
   * @param {string} operationName
   * @param {string} returnFields
   * @param {string} variables
   * @see https://www.npmjs.com/package/gql-query-builder
   * @example
   * const variables = {
   *    name: { value: "Tyrion Lannister", required: true },
   * }
   * const query = await queryData({ operationName: 'author', returnFields = ['id', 'name'], variables })
   * @returns {Object} data
   */
  this.mutationData = async function ({ operationName, returnFields = [], variables = {} }) {
    try {
      loggerFactory.warn(`mutationData has been start with`, {
        requestId: `${requestId}`,
        args: {
          operationName: operationName,
          variables: variables,
        },
      });

      const queryBuilder = mutation({
        operation: operationName,
        variables: variables,
        fields: returnFields,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: queryBuilder.query, variables: queryBuilder.variables }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      loggerFactory.warn(`mutationData has been end`, {
        requestId: `${requestId}`,
      });
      return response.status === 200 ? data.data : data.errors;
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
