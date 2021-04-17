import { makeExecutableSchema, gql } from 'apollo-server-express';
import merge from 'lodash/merge';
import { SpotifyResolvers, SpotifySchema } from './modules';

const Common = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [Common, SpotifySchema],
  resolvers: merge({}, SpotifyResolvers),
  schemaDirectives: {},
});

export default schema;
