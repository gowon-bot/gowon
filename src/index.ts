// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import { GuildMember } from "discord.js";
import config from "../config.json";
import { client, handler, guildEventService, setup } from "./setup";
import chalk from "chalk";
import { gowonAPIPort } from "./api";

async function start() {
  await setup();

  client.client.on("ready", () => {
    console.log(
      chalk`\n{white Logged in as} {magenta ${
        client.client?.user && client.client.user.tag
      }}\n` +
        chalk`{white API running at} {magenta http://localhost:${gowonAPIPort}}`
    );
    console.log(chalk`\n{white Setup complete!}\n`);

    handler.setClient(client);
  });

  client.client.on("messageCreate", (msg) => {
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
