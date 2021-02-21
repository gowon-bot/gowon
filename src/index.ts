// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import pm2 from "pm2";

import { CommandHandler } from "./lib/command/CommandHandler";
import { Client } from "discord.js";
import { DB } from "./database";
import { RedisService } from "./services/RedisService";
import config from "../config.json";
import { GraphQLAPI } from "./api";
import { GowonClient } from "./lib/GowonClient";
import { GuildSetupService } from "./services/GuildSetupService";
import { GowonService } from "./services/GowonService";

const client = new GowonClient(new Client(), config.environment);
const handler = new CommandHandler();
const redisService = new RedisService();
const guildSetupService = new GuildSetupService(client);
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
    guildSetupService.init(),
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
    guildSetupService.handleNewGuild(guild);
  });

  client.client.login(config.discordToken);
}

start();
