'use strict';

const winext = require('winext');
const { GraphQLSchema } = winext.require('graphql');

const convertGraphqlSchema = (modelDescriptor = []) => {
  // const schema = new GraphQLSchema({
  //   query: {},
  //   // If you need to create or updata a datasource,
  //   // you use mutations. Note:
  //   // mutations will not be explored in this post.
  //   // mutation: BlogMutationRootType
  // });
  // return schema;
  return {};
};

module.exports = convertGraphqlSchema;
