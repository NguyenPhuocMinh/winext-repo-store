'use strict';

const winext = require('winext');
const Promise = winext.require('bluebird');
const lodash = winext.require('lodash');
const mongoose = winext.require('mongoose');
const mysql = winext.require('mysql');
const graphql = winext.require('graphql');
const { ApolloServer } = winext.require('apollo-server-express');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} = winext.require('apollo-server-core');
const dataMongoStore = require('../store/data-mongo-store');
const dataSequelizeStore = require('../store/data-sequelize-store');
const dataGraphqlStore = require('../store/data-graphql-store');
const { get, isEmpty } = lodash;

const options = require('../conf/options');
const profiles = require('../conf/profiles');

function RepoStore(params = {}) {
  const loggerTracer = get(params, 'loggerTracer');
  /**
   * Mongoose
   */
  mongoose.Promise = global.Promise;
  mongoose.set('debug', true);

  const mongooseConfig = get(params, 'config.mongoose');
  const enableMongoose = get(mongooseConfig, 'enable', false);
  const hostMongoose = profiles.hostMongoose || get(mongooseConfig, 'host');
  const portMongoose = profiles.portMongoose || get(mongooseConfig, 'port');
  const userMongoose = profiles.userMongoose || get(mongooseConfig, 'user');
  const passwordMongoose = profiles.passwordMongoose || get(mongooseConfig, 'password');
  const nameMongoose = profiles.nameMongoose || get(mongooseConfig, 'name');

  const mongoUrl = enableMongoose
    ? `mongodb://${userMongoose}:${passwordMongoose}@${hostMongoose}:${portMongoose}/${nameMongoose}`
    : `mongodb://${hostMongoose}:${portMongoose}/${nameMongoose}`;

  /**
   * MySQL
   */
  const mysqlConfig = get(params, 'config.mysql');
  const hostMySql = profiles.hostMySql || get(mysqlConfig, 'host', 'localhost');
  const portMySql = profiles.portMySql || get(mysqlConfig, 'port', 3306);
  const userMysql = profiles.userMysql || get(mysqlConfig, 'user', 'root');
  const passwordMysql = profiles.passwordMysql || get(mysqlConfig, 'password', 'root');
  const databaseMySql = profiles.databaseMySql || get(mysqlConfig, 'name', 'database');
  const sequelizeOptions = get(mysqlConfig, 'sequelizeOptions');
  const dialect = get(sequelizeOptions, 'dialect', options.sequelizeOptions.mysql);

  const mysqlUrl = `${dialect}://${userMysql}:${passwordMysql}@${hostMySql}:${portMySql}/${databaseMySql}`;

  const createConnection = mysql.createConnection({
    host: hostMySql,
    port: portMySql,
    user: userMysql,
    password: passwordMysql,
    database: databaseMySql,
  });

  /**
   * Graphql
   */
  const graphqlConfig = get(params, 'config.graphql');
  const enableGraphql = get(graphqlConfig, 'enable', false);
  const enableGraphiql = get(graphqlConfig, 'enableGraphiql', false);
  const pathGraphql = profiles.pathGraphql || get(graphqlConfig, 'path', '/graphql');
  const mockingGraphql = get(graphqlConfig, 'mocks');
  const modelGraphqlDescriptor = get(params, 'modelGraphqlDescriptor');

  /**
   * Start Mongo
   */
  this.startMongo = async function () {
    try {
      if (isEmpty(mongooseConfig)) {
        return;
      }
      loggerTracer.info(`Mongo has been start !!!`);
      await mongoose.connect(
        mongoUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (!err) {
            loggerTracer.http(`Mongoose connect complete on`, {
              args: `[${mongoUrl}]`,
            });
          } else {
            loggerTracer.error(`Mongoose connect has error`, {
              args: err,
            });
            throw err;
          }
        }
      );
    } catch (err) {
      loggerTracer.error(`Start mongo has been error`, {
        args: err,
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
        return;
      }
      loggerTracer.warn(`Mongo has been close !!!`);
      await mongoose.connection.close();
    } catch (err) {
      loggerTracer.error(`Stop mongo has error`, {
        args: err,
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
        return;
      }
      await createConnection.connect((err) => {
        if (!err) {
          loggerTracer.info(`Mysql has been start !!!`);

          loggerTracer.http(`MySql connect complete on`, {
            args: `[${mysqlUrl}]`,
          });
        }
      });
      await dataSequelizeStore.sequelize.authenticate().then((err) => {
        if (!err) {
          loggerTracer.info(`Connect Sequelize complete`);
        } else {
          throw err;
        }
      });
    } catch (err) {
      loggerTracer.error(`Start mysql has been error`, {
        args: err,
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
        return;
      }
      loggerTracer.warn(`MySql has been close !!!`);
      await createConnection.end();
      await dataSequelizeStore.sequelize.close();
    } catch (err) {
      loggerTracer.error(`Stop mysql close has error`, {
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
  /**
   * Graphql
   */
  this.graphql = graphql;
  /**
   * Start graphql
   * @param {*} app
   * @param {*} server
   */
  this.startGraphql = async function (app, server, pathServer) {
    try {
      if (isEmpty(graphqlConfig) || !enableGraphql) {
        return;
      }
      loggerTracer.info(`Graphql has been start !!!`);
      const apolloServer = new ApolloServer({
        schema: modelGraphqlDescriptor,
        graphiql: enableGraphiql,
        mocks: mockingGraphql,
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer: server }),
          profiles.isProduction
            ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
            : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
        ],
      });

      await apolloServer.start();
      apolloServer.applyMiddleware({ app, path: pathGraphql });

      loggerTracer.http(`Graphql connect complete on`, {
        args: `[${pathServer}${apolloServer.graphqlPath}]`,
      });
    } catch (err) {
      loggerTracer.error(`Start graphql has been error`, {
        args: err,
      });
      return Promise.reject(err);
    }
  };
  /**
   * Stop graphql
   */
  this.stopGraphql = async function (server) {
    try {
      if (isEmpty(graphqlConfig) || !enableGraphql) {
        return;
      }
      const apolloServer = new ApolloServer({
        schema: modelGraphqlDescriptor,
        graphiql: enableGraphiql,
        mocks: mockingGraphql,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],
      });

      loggerTracer.warn(`Graphql has been close !!!`);
      await apolloServer.stop();
    } catch (err) {
      loggerTracer.error(`Stop graphql has been error`, {
        args: err,
      });
      return Promise.reject(err);
    }
  };
  /**
   * dataGraphqlStore
   */
  this.dataGraphqlStore = dataGraphqlStore;
}

exports = module.exports = new RepoStore();
exports.register = RepoStore;
