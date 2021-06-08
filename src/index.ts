// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import pm2 from "pm2";

import { CommandHandler } from "./lib/command/CommandHandler";
import { Client, GuildMember } from "discord.js";
import { DB } from "./database";
import { RedisService } from "./services/RedisService";
import config from "../config.json";
import { GraphQLAPI } from "./api";
import { GowonClient } from "./lib/GowonClient";
import { GuildEventService } from "./services/guilds/GuildEventService";
import { GowonService } from "./services/GowonService";

const client = new GowonClient(
  new Client({
    // List of intents: https://discord.com/developers/docs/topics/gateway#list-of-intents
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING",
    ],
  }),
  config.environment
);
const handler = new CommandHandler();
const redisService = new RedisService();
const guildEventService = new GuildEventService(client);
const db = new DB();
const api = new GraphQLAPI();
const gowonService = GowonService.getInstance();

async function start() {
  pm2.connect((err) => {
    if (err) {
      console.warn(
        "WARNING: Could not connect to pm2, some commands may not work"
      );
    } else {
      client.hasPM2 = true;
    }
  });

  await Promise.all([
    db.connect(),
    handler.init(),
    redisService.init(),
    api.init(),
    guildEventService.init(),
  ]);

  // SettingsManager needs the database to be connected to cache settings
  await gowonService.settingsManager.init();

  client.client.on("ready", () => {
    console.log(
      `Logged in as ${client.client?.user && client.client.user.tag}!`
    );
    client.client.user!.setPresence({
      activity: {
        name: "One & Only",
        type: "LISTENING",
        url: "https://github.com/jivison/gowon",
      },
    });
    handler.setClient(client);
  });

  client.client.on("message", (msg) => {
    handler.handle(msg);
  });

  client.client.on("guildCreate", (guild) => {
    guildEventService.handleNewGuild(guild);
  });

  client.client.on("guildDelete", (guild) => {
    guildEventService.handleGuildLeave(guild);
  });

  client.client.on("guildMemberAdd", (guildMember) => {
    guildEventService.handleNewUser(guildMember);
  });

  client.client.on("guildMemberRemove", (guildMember) => {
    guildEventService.handleUserLeave(guildMember as GuildMember);
  });

  client.client.login(config.discordToken);
}

start();
