import { gql } from 'apollo-server-express';
import SpotifyService from 'services/SpotifyService';

export const typeDef = gql`
  type SpotifyUser {
    _id: ID!
    name: String!
  }

  type Song {
    _id: ID!
    albumUri: String!
    artistUri: String!
    imageUrl: String
    name: String!
    artistName: String!
  }
  type SongsWithTimestamps {
    _id: ID!
    song: Song!
    timestamps: [DateTime!]!
  }
  type User {
    _id: ID!
    name: String!
  }

  extend type Query {
    spotifySongsByUser(userUri: String!, startDate: DateTime, endDate: DateTime): [SongsWithTimestamps]!
    spotifyUser(userUri: String): User!
    spotifySongsUsersList: [SpotifyUser]
  }
  # extend type Mutation {
  # }
`;

export const resolvers = {
  Query: {
    spotifySongsUsersList: () => SpotifyService.spotifySongsUsersList(),
    spotifySongsByUser: (_, { startDate, endDate, userUri }) => SpotifyService.spotifySongsByUser({ startDate, endDate, userUri }),
    spotifyUser: (_, { userUri }) => SpotifyService.spotifyUser({ userUri }),
  },
  // Mutation: {
  // },
};
