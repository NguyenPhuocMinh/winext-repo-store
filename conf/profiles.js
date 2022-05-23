'use strict';

const winext = require('winext');
const dotenv = winext.require('dotenv');
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const protocol = process.env.PROTOCOL;
const portServer = process.env.SERVER_PORT;
const hostServer = process.env.SERVER_HOST;

const hostMongoose = process.env.MONGO_HOST;
const portMongoose = process.env.MONGO_PORT;
const userMongoose = process.env.MONGO_USER;
const passwordMongoose = process.env.MONGO_PASSWORD;
const nameMongoose = process.env.MONGO_DATABASE;

const hostMySql = process.env.SQL_HOST;
const portMySql = process.env.SQL_PORT;
const userMysql = process.env.SQL_USER;
const passwordMysql = process.env.SQL_PASSWORD;
const databaseMySql = process.env.SQL_DATABASE;

const pathGraphql = process.env.GRAPHQL_PATH;

const profiles = {
  isProduction,
  protocol,
  portServer,
  hostServer,
  hostMongoose,
  portMongoose,
  userMongoose,
  passwordMongoose,
  nameMongoose,
  hostMySql,
  portMySql,
  userMysql,
  passwordMysql,
  databaseMySql,
  pathGraphql,
};

module.exports = profiles;
