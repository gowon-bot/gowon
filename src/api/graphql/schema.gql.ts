import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type Query {
    commands(keywords: String, isAdmin: Boolean): [Command!]!
    allSettings: [Setting!]!
    guildSettings(guildID: String!): [GuildSetting!]!

    guild(guildID: String!): Guild
    roles(guildID: String!): [Role!]!
  }

  type Mutation {
    login(code: String!, discordID: String!): User!

    saveGuildSettings(guildID: String!, settings: [GuildSettingInput!]!): String
  }

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
    children: [Command!]!
  }

  type Variation {
    name: String!
    variation: [String!]!
    description: String
  }

  enum SettingType {
    toggle
    role
    textshort
    text
    textlong
  }

  enum SettingScope {
    user
    guild
    guildmember
    bots
  }

  type Setting {
    name: String!
    category: String
    friendlyName: String!
    description: String!
    type: SettingType!
    scope: SettingScope!
  }

  type Role {
    id: String!
    name: String!
    colour: String!
  }

  type SettingValue {
    role: Role
    string: String
    boolean: Boolean
  }

  type GuildSetting {
    setting: Setting!
    value: SettingValue
  }

  type Guild {
    id: String!
    name: String!
    image: String
    canAdmin: Boolean!
  }

  # Inputs
  input GuildSettingInput {
    setting: SettingInput!
    value: SettingValueInput
  }

  input SettingInput {
    name: String!
    friendlyName: String
    description: String
    type: SettingType
    scope: SettingScope
  }

  input SettingValueInput {
    role: RoleInput
    string: String
    boolean: Boolean
  }

  input RoleInput {
    id: String!
    name: String
    colour: String
  }
`;
