// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import { CommandHandler } from "./lib/command/CommandHandler";
import { Client } from "discord.js";
import { DB } from "./database";
import { RedisService } from "./services/RedisService";
import config from "../config.json";
import { GraphQLAPI } from "./graphql_api";

const client = new Client();
const handler = new CommandHandler();
const redisService = new RedisService();
const db = new DB();
const api = new GraphQLAPI();

async function start() {
  await Promise.all([
    db.connect(),
    handler.init(),
    redisService.init(),
    api.init(),
  ]);

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
