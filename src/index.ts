// Shim required for typeorm
import "reflect-metadata";

import { ServiceRegistry } from "./services/ServicesRegistry";
ServiceRegistry.setServices();

import chalk from "chalk";
import { GuildMember } from "discord.js";
import config from "../config.json";
import { AnalyticsCollector } from "./analytics/AnalyticsCollector";
import { gowonAPIPort } from "./api";
import { HeaderlessLogger } from "./lib/Logger";
import { GowonContext } from "./lib/context/Context";
import { Payload } from "./lib/context/Payload";
import { displayUserTag } from "./lib/views/displays";
import { MockMessage } from "./mocks/discord";
import { ReportingService } from "./services/analytics/ReportingService";
import { UsersService } from "./services/dbservices/UsersService";
import {
  client,
  guildEventService,
  handler,
  interactionHandler,
  setup,
} from "./setup";

function context() {
  return new GowonContext({
    gowonClient: client,
    command: { client, logger: new HeaderlessLogger() } as any,
    payload: new Payload(new MockMessage()),
    custom: {},
  } as any);
}

async function start() {
  await setup(context());

  const analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  const usersService = ServiceRegistry.get(UsersService);
  const reportingService = ServiceRegistry.get(ReportingService);

  reportingService.init();

  client.client.on("ready", () => {
    console.log(
      chalk`\n{white Logged in as} {magenta ${
        client.client?.user && displayUserTag(client.client.user)
      }}\n` +
        chalk`{white API running at} {magenta http://localhost:${gowonAPIPort}}`
    );

    console.log(chalk`\n{white Setup complete!}\n`);

    handler.setClient(client);
    interactionHandler.setClient(client);
  });

  client.client.on("messageCreate", (msg) => {
    handler.handle(msg);
  });

  client.client.on("guildCreate", (guild) => {
    const ctx = context();

    analyticsCollector.metrics.guildCount.set(client.client.guilds.cache.size);
    guildEventService.handleNewGuild(ctx, guild);
  });

  client.client.on("guildDelete", (guild) => {
    const ctx = context();

    analyticsCollector.metrics.guildCount.set(client.client.guilds.cache.size);
    guildEventService.handleGuildLeave(ctx, guild);
  });

  client.client.on("guildMemberAdd", (guildMember) => {
    const ctx = context();

    guildEventService.handleNewUser(ctx, guildMember);
  });

  client.client.on("guildMemberRemove", (guildMember) => {
    const ctx = context();

    guildEventService.handleUserLeave(ctx, guildMember as GuildMember);
  });

  client.client.on("interactionCreate", (interaction) => {
    interactionHandler.handle(interaction);
  });

  // For setting permissions on commands
  client.client.on("roleCreate", (role) => {
    const ctx = context();

    guildEventService.handleRoleCreate(ctx, role);
  });

  client.client.on("roleUpdate", (oldRole, newRole) => {
    const ctx = context();

    guildEventService.handleRoleUpdate(ctx, oldRole, newRole);
  });

  client.client.login(config.discordToken);

  const guildCount = client.client.guilds.cache.size;
  const userCount = await usersService.countUsers(context());

  analyticsCollector.metrics.guildCount.set(guildCount);
  analyticsCollector.metrics.userCount.set(userCount);
}

start();

process.on("unhandledRejection", (e) => {
  console.error("UNHANDLED REJECTION:");

  console.error(e);
});
