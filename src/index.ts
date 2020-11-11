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
import { GraphQLAPI } from "./graphql_api";
import { GowonClient } from "./lib/GowonClient";

const client = new GowonClient(new Client(), config.environment);
const handler = new CommandHandler();
const redisService = new RedisService();
const db = new DB();
const api = new GraphQLAPI();

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
  ]);

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

  client.client.login(config.discordToken);
}

start();
