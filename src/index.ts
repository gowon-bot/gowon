// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import { CommandHandler } from "./lib/command/CommandHandler";

import { Client } from "discord.js";
import { DB } from "./database";

import config from "../config.json";
import { Dashboard } from "./dashboard";
import { RedisService } from "./services/RedisService";

const client = new Client();
const handler = new CommandHandler();
const dashboard = new Dashboard();
const redisService = new RedisService();

dashboard.init();

Promise.all([DB.connect(), handler.init(), redisService.init()]).then(() => {
  client.on("ready", () => {
    console.log(`Logged in as ${client?.user && client.user.tag}!`);
  });

  client.on("message", (msg) => {
    handler.handle(msg);
  });

  client.login(config.discordToken);
});
