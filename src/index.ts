// Shim required for typeorm
import "reflect-metadata";

import { ServiceRegistry } from "./services/ServicesRegistry";
ServiceRegistry.setServices();

import { GuildMember } from "discord.js";
import config from "../config.json";
import {
  client,
  handler,
  guildEventService,
  setup,
  interactionHandler,
  twitterService,
} from "./setup";
import chalk from "chalk";
import { gowonAPIPort } from "./api";
import { AnalyticsCollector } from "./analytics/AnalyticsCollector";
import { UsersService } from "./services/dbservices/UsersService";
import { HeaderlessLogger } from "./lib/Logger";
import { GowonContext } from "./lib/context/Context";
import { TweetHandler } from "./services/Twitter/TweetHandler";
import { Payload } from "./lib/context/Payload";
import { MockMessage } from "./mocks/discord";

function context() {
  return new GowonContext({
    gowonClient: client,
    command: { client, logger: new HeaderlessLogger() } as any,
    payload: new Payload(new MockMessage()),
    custom: {},
  } as any);
}

async function start() {
  await setup();

  const analyticsCollector = ServiceRegistry.get(AnalyticsCollector);
  const usersService = ServiceRegistry.get(UsersService);
  const tweetHandler = new TweetHandler();

  await tweetHandler.init();

  client.client.on("ready", () => {
    console.log(
      chalk`\n{white Logged in as} {magenta ${
        client.client?.user && client.client.user.tag
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

  twitterService.mentions.subscribe(async (tweet) => {
    try {
      await tweetHandler.handle(tweet, client);
    } catch (e) {
      console.log(e);
    }
  });

  twitterService.mentions.connect();
}

start();

function unsubscribe() {
  if (twitterService.mentions) {
    twitterService.mentions.unsubscribe();
  }

  process.exit();
}

//catches ctrl+c event
process.on("SIGINT", unsubscribe);

// // catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", unsubscribe);
process.on("SIGUSR2", unsubscribe);

process.on("unhandledRejection", (e) => {
  console.error("UNHANDLED REJECTION:");

  console.error(e);
});
