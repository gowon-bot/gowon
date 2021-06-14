import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type Query {
    ping: String!
  }

  type Mutation {
    discordAuthenticate(code: String!): SimpleUser!
  }

  type SimpleUser {
    discordID: String!
    username: String!
    avatarURL: String!
  }
`;
