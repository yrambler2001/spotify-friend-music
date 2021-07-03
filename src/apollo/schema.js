import { makeExecutableSchema, gql } from 'apollo-server-express';
import merge from 'lodash/merge';
import { DateTimeResolver, DateTimeTypeDefinition } from 'graphql-scalars';
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
  typeDefs: [Common, DateTimeTypeDefinition, SpotifySchema],
  resolvers: merge({}, { DateTime: DateTimeResolver }, SpotifyResolvers),
  schemaDirectives: {},
});

export default schema;
