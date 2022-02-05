import { Guild, User } from "discord.js";

export interface Payload {
  guild: Guild;
  author: User;
}
