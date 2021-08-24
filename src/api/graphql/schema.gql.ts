import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    discordID: String!
    lastFMUsername: String!
    discordAuthCode: String
  }

  type Command {
    id: ID!
    idSeed: String!
    name: String!
    friendlyName: String!
    description: String!
    parentName: String

    aliases: [String!]!
    variations: [Variation!]!

    category: String
    subcategory: String
    usage: [String!]!

    hasChildren: Boolean!
  }

  type Variation {
    name: String!
    variation: [String!]!
    description: String
  }

  type Query {
    commands(keywords: String): [Command!]!
  }

  type Mutation {
    login(code: String!, discordID: String!): User!
  }
`;
