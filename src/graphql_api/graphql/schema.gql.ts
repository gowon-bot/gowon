import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    discordID: String!
    lastFMUsername: String!
    discordAuthCode: String
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

  type SimpleCrown {
    plays: Int
    artistName: String
  }

  type CrownEvent {
    id: ID!
    event: String!
    snatchedEvent: String

    perpetuatorDiscordID: String!
    perpetuatorUsername: String!
    secondaryUserDiscordID: String
    secondaryUsername: String

    crown: Crown!

    oldCrown: SimpleCrown
    newCrown: SimpleCrown!

    happenedAt: Date!
  }

  type Query {
    # User queries
    user(id: ID!): User
    users: [User!]!
    userByDiscordID(discordID: String!): User

    # Crown queries
    crown(id: ID!): Crown
    crownsByUser(discordID: String): [Crown!]!
    crownsByServer(serverID: String!): [Crown!]!
    crownHistory(crownID: ID!): [CrownEvent!]!
  }

  type Mutation {
    login(code: String!, discordID: String!): User!
  }
`;
