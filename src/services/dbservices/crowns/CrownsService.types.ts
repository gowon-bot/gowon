import { User as DiscordUser } from "discord.js";
import { ArtistRedirect } from "../../../database/entity/ArtistRedirect";
import { Crown } from "../../../database/entity/Crown";
import { User } from "../../../database/entity/User";

export interface CrownOptions {
  artistName: string;
  plays: number;
  senderDBUser: User;
}

export interface OldCrownCheck {
  crown?: Crown;
  oldCrown?: Crown;
  state: CrownState;
  artistName: string;
  redirect: ArtistRedirect;
}

export interface CrownHolder {
  user: DiscordUser;
  numberOfCrowns: number;
}

export interface CrownDisplay {
  crown: Crown;
  user?: DiscordUser;
}

export enum CrownState {
  tie = "Tie",
  snatched = "Snatched",
  fail = "Fail",
  newCrown = "New crown",
  updated = "Updated",
  tooLow = "Too low",
  inactivity = "Inactivity",
  purgatory = "Purgatory",
  left = "Left",
  banned = "Banned",
  loggedOut = "Logged out",
}
