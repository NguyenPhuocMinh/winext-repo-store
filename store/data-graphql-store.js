'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const fetch = winext.require('node-fetch');
const { query, mutation } = require('gql-query-builder');
const { get } = lodash;

const profiles = require('../conf/profiles');

function DataGraphqlStore(params = {}) {
  const loggerTracer = get(params, 'loggerTracer');
  const graphqlConfig = get(params, 'config.graphql');

  const protocol = profiles.protocol;
  const portServer = profiles.portServer;
  const hostServer = profiles.hostServer;
  const pathGraphql = profiles.pathGraphql || get(graphqlConfig, 'path', '/graphql');

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
      loggerTracer.info(`QueryData has been start with`, {
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
      loggerTracer.info(`QueryData has been end`);
      return data;
    } catch (err) {
      loggerTracer.error(`QueryData graphql has been error`, {
        args: err.message,
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
      loggerTracer.info(`MutationData has been start with`, {
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
      loggerTracer.info(`MutationData has been end`);
      return response.status === 200 ? data.data : data.errors;
    } catch (err) {
      loggerTracer.error(`MutationData graphql has been error`, {
        args: err.message,
      });
      return Promise.reject(err);
    }
  };
}

exports = module.exports = new DataGraphqlStore();
exports.register = DataGraphqlStore;
