import { User as DiscordUser } from "discord.js";
import { User as DBUser } from "../../../database/entity/User";
import { Perspective } from "../../../lib/Perspective";
import { Requestable } from "../../LastFM/LastFMAPIService";
import { LilacUser } from "../../lilac/converters/user";

export const argumentKeys = {
  username: "username",
  user: "user",
  lfmMention: "lastfmUsername",
  userID: "userID",
  discordUsername: "discordUsername",
  friendMention: "friendMention",
};

export interface GetMentionsOptions {
  // Validation

  /** If set to true, throws an error if the sender is not signed in */
  senderRequired: boolean;
  /** If set to true, throws an error if no username is provided */
  usernameRequired: boolean;
  /** If set to true, throws an error if the returned user isn't indexed */
  indexedRequired?: boolean;
  /** If set to true, throws an error if the user is not authenticated with Last.fm */
  lfmAuthentificationRequired?: boolean;
  /** If set to true, throws an error if a database user is not found */
  dbUserRequired?: boolean;
  /** If set to true, throws an error if the user does not have premium */
  backerRequired?: boolean;

  /** @deprecated Use `dbUserRequired` instead */
  reverseLookup: {
    required?: boolean;
  };

  /** If set to true, fetches a Discord user from the returned user's Discord ID or the provided user id */
  fetchDiscordUser: boolean;
  /** If set to true, fetches a user's profile from Lilac */
  fetchLilacUser: boolean;

  // Argument keys
  /** The argument key to find the inputed username */
  usernameArgumentKey: string;

  // Perspective
  /** Passed into Perspective for the `asCode` argument  */
  perspectiveAsCode: boolean;
}

export interface Mentions {
  // Returned user's properties
  dbUser: DBUser;
  discordUser?: DiscordUser;
  lilacUser?: LilacUser;
  perspective: Perspective;
  requestable: Requestable;
  username: string;

  // Sender's properties
  senderLilacUser?: LilacUser;
  senderRequestable: Requestable;
  senderUsername: string;
  senderUser?: DBUser;

  // Mentioned user's properties
  mentionedUsername?: string;
  mentionedDBUser?: DBUser;
  mentionedLilacUser?: LilacUser;
}

export interface PartialMentions {
  dbUser: DBUser;
  discordID: string;
  username: string;
  discordUser?: DiscordUser;
  lilacUser?: LilacUser;
}

export type MentionsUser = "sender" | "mentioned";

export interface Requestables {
  senderUsername: string;
  senderRequestable: Requestable;

  username: string;
  requestable: Requestable;
}
