import { gql } from 'apollo-server-express';

export const typeDef = gql`
  extend type Query {
    test: String
  }
  # extend type Mutation {
  # }
`;

export const resolvers = {
  Query: {
    test: () => 'test',
  },
  // Mutation: {
  // },
};
