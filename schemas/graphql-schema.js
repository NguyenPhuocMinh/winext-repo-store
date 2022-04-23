'use strict';

const winext = require('winext');
const lodash = winext.require('lodash');
const graphql = winext.require('graphql');
const { isEmpty, get } = lodash;
const { GraphQLSchema, GraphQLObjectType, GraphQLList } = graphql;

const convertGraphqlSchema = (modelDescriptor = {}) => {
  // const AuthorType = new GraphQLObjectType({
  //   name: "Author",
  //   description: "This represent an author",
  //   fields: () => ({
  //     id: {type: new GraphQLNonNull(GraphQLString)},
  //     name: {type: new GraphQLNonNull(GraphQLString)},
  //     twitterHandle: {type: GraphQLString}
  //   })
  // });

  // const PostType = new GraphQLObjectType({
  //   name: "Post",
  //   description: "This represent a Post",
  //   fields: () => ({
  //     id: {type: new GraphQLNonNull(GraphQLString)},
  //     title: {type: new GraphQLNonNull(GraphQLString)},
  //     body: {type: GraphQLString},
  //     author: {
  //       type: AuthorType,
  //       resolve: function(post) {
  //         return _.find(Authors, a => a.id == post.author_id);
  //       }
  //     }
  //   })
  // });

  // const queryRootType = new GraphQLObjectType({
  //   name: 'RootAppSchema',
  //   description: 'Application Schema Root',
  //   fields: () => ({
  //     authors: {
  //       type: new GraphQLList(AuthorType),
  //       description: "List of all Authors",
  //       resolve: function() {
  //         return Authors
  //       }
  //     },
  //     posts: {
  //       type: new GraphQLList(PostType),
  //       description: "List of all Posts",
  //       resolve: function() {
  //         return Posts
  //       }
  //     }
  //   })
  // });
  // const schema = new GraphQLSchema({
  //   query: queryRootType,
  //   // If you need to create or updata a datasource,
  //   // you use mutations. Note:
  //   // mutations will not be explored in this post.
  //   // mutation: BlogMutationRootType
  // });
  // return schema;
  return {};
};

module.exports = convertGraphqlSchema;
