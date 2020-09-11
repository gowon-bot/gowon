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
const db = new DB();

dashboard.init();

async function start() {
  await Promise.all([db.connect(), handler.init(), redisService.init()]);

  client.on("ready", () => {
    console.log(`Logged in as ${client?.user && client.user.tag}!`);
    handler.setClient(client);
  });

  client.on("message", (msg) => {
    handler.handle(msg);
  });

  client.login(config.discordToken);
}

start();
