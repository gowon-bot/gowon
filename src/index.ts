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
import { AnalyticsCollector } from "./analytics/AnalyticsCollector";
import { UsersService } from "./services/dbservices/UsersService";
import { Logger } from "./lib/Logger";
import { GowonContext } from "./lib/context/Context";

async function start() {
  await setup();

  const ctx = new GowonContext({
    command: { gowonClient: client, logger: new Logger() } as any,
    custom: {},
  } as any);

  const analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  const usersService = ServiceRegistry.get(UsersService);

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
    analyticsCollector.metrics.guildCount.set(client.client.guilds.cache.size);
    guildEventService.handleNewGuild(ctx, guild);
  });

  client.client.on("guildDelete", (guild) => {
    analyticsCollector.metrics.guildCount.set(client.client.guilds.cache.size);
    guildEventService.handleGuildLeave(ctx, guild);
  });

  client.client.on("guildMemberAdd", (guildMember) => {
    guildEventService.handleNewUser(ctx, guildMember);
  });

  client.client.on("guildMemberRemove", (guildMember) => {
    guildEventService.handleUserLeave(ctx, guildMember as GuildMember);
  });

  client.client.login(config.discordToken);

  const guildCount = client.client.guilds.cache.size;
  const userCount = await usersService.countUsers(ctx);

  analyticsCollector.metrics.guildCount.set(guildCount);
  analyticsCollector.metrics.userCount.set(userCount);
}

start();
