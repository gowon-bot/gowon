// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";

import { CommandHandler } from "./lib/command/CommandHandler";

import { Client } from "discord.js";
import { DB } from "./database";

import config from "../config.json";
import { Dashboard } from "./dashboard";

const client = new Client();
const handler = new CommandHandler();

let dashboard = new Dashboard();

dashboard.init();

Promise.all([DB.connect(), handler.init()]).then(() => {
  client.on("ready", () => {
    console.log(`Logged in as ${client?.user && client.user.tag}!`);
  });

  client.on("message", (msg) => {
    handler.handle(msg);
  });

  client.login(config.discordToken);
});
