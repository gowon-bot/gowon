// Shim required for typeorm
import "reflect-metadata";

import "./extensions/string.extensions";
import "./extensions/array.extensions";

import { ServiceRegistry } from "./services/ServicesRegistry";
ServiceRegistry.setServices();

import { GuildMember } from "discord.js";
import config from "../config.json";
import { client, handler, guildEventService, setup } from "./setup";
import chalk from "chalk";
import { gowonAPIPort } from "./api";

async function start() {
  await setup();

  const ctx = { client };

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
    guildEventService.handleNewGuild(ctx, guild);
  });

  client.client.on("guildDelete", (guild) => {
    guildEventService.handleGuildLeave(ctx, guild);
  });

  client.client.on("guildMemberAdd", (guildMember) => {
    guildEventService.handleNewUser(ctx, guildMember);
  });

  client.client.on("guildMemberRemove", (guildMember) => {
    guildEventService.handleUserLeave(ctx, guildMember as GuildMember);
  });

  client.client.login(config.discordToken);
}

start();
