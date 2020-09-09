import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    discordID: String!
    serverID: String!
    lastFMUsername: String!
  }

  type Crown {
    id: ID!
    serverID: String!
    artistName: String!
    plays: Int!
    version: Int!
    lastStolen: Date!
    createdAt: Date!
    deletedAt: Date

    user: User!
  }

  type Query {
    # User queries
    user(id: ID!): User
    users(serverID: String!): [User!]!
    userByDiscordID(discordID: String!): User

    # Crown queries
    crown(id: ID!): Crown
    crownsByUser(discordID: String!): [Crown!]!
    crownsByServer(serverID: String!): [Crown!]!
  }
`;
