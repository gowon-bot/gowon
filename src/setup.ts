import config from "../config.json";

import chalk from "chalk";
import { Client, Intents } from "discord.js";
import gql from "graphql-tag";
import { GraphQLAPI } from "./api";
import { DB } from "./database/DB";
import { Stopwatch } from "./helpers";
import { uppercaseFirstLetter } from "./helpers/string";
import { GowonClient } from "./lib/GowonClient";
import { lilacClient } from "./lib/Lilac/client";
import { CommandHandler } from "./lib/command/CommandHandler";
import {
  CommandRegistry,
  generateCommands,
} from "./lib/command/CommandRegistry";
import { InteractionHandler } from "./lib/command/interactions/InteractionHandler";
import { GowonContext } from "./lib/context/Context";
import { mirrorballClient } from "./lib/indexing/client";
import { SettingsService } from "./lib/settings/SettingsService";
import { GuildEventService } from "./services/Discord/GuildEventService";
import { GowonService } from "./services/GowonService";
import { ServiceRegistry } from "./services/ServicesRegistry";
import { IntervaledJobsService } from "./services/intervaledJobs/IntervaledJobsService";
import { RedisInteractionService } from "./services/redis/RedisInteractionService";

export const client = new GowonClient(
  new Client({
    // List of intents: https://discord.com/developers/docs/topics/gateway#list-of-intents
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MESSAGE_TYPING,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    presence: {
      status: "online",
      activities: [
        {
          name: "One & Only",
          type: "LISTENING",
          url: "https://gowon.bot",
        },
      ],
    },
    allowedMentions: { parse: ["users", "roles"] },
    partials: ["CHANNEL"],
    shards: "auto",
  }),
  config.environment
);

export const handler = new CommandHandler();
export const interactionHandler = new InteractionHandler();
const db = new DB();
const api = new GraphQLAPI(client);
const settingsService = ServiceRegistry.get(SettingsService);
const redisService = ServiceRegistry.get(RedisInteractionService);
const intervaledJobsService = ServiceRegistry.get(IntervaledJobsService);
export const guildEventService = ServiceRegistry.get(GuildEventService);

export async function setup(ctx: GowonContext) {
  console.log(
    chalk`{cyan ${
      asciiArt + "\n" + "=".repeat(asciiArt.split("\n").reverse()[0].length)
    }}\n{yellow -${uppercaseFirstLetter(config.environment)}-}\n`
  );

  await Promise.all([
    connectToDB(),
    connectToRedis(),
    connectToMirrorball(),
    connectToLilac(),
    intializeAPI(),
    initializeCommandRegistry(),
  ]);

  // These depend on other initilzations above
  await Promise.all([
    // The interaction handler depends on the command registry
    initializeInteractions(),
    // The below needs to the database to be initialized
    initializeSettingsManager(),
    seedCache(),
    startIntervaledJobs(ctx),
  ]);
}

function connectToDB() {
  return logStartup(() => db.connect(), "Connected to database");
}

function connectToRedis() {
  return logStartup(() => redisService.init(), "Connected to Redis");
}

function intializeAPI() {
  return logStartup(() => api.init(), "Initialized API");
}

function initializeSettingsManager() {
  return logStartup(
    () => settingsService.init(),
    "Initialized settings manager"
  );
}

function initializeInteractions() {
  return logStartup(
    () => interactionHandler.init(),
    "Initialized interactions"
  );
}

function connectToMirrorball() {
  return logStartup(async () => {
    await mirrorballClient.query({
      query: gql`
        query {
          ping
        }
      `,
    });
  }, "Connected to Mirrorball");
}

function connectToLilac() {
  return logStartup(async () => {
    await lilacClient.query({
      query: gql`
        query {
          ping
        }
      `,
    });
  }, "Connected to Lilac");
}

function initializeCommandRegistry() {
  return logStartup(
    async () => CommandRegistry.getInstance().init(await generateCommands()),
    "Initialized command registry"
  );
}

function seedCache() {
  return logStartup(async () => {
    const gowonService = ServiceRegistry.get(GowonService);

    await gowonService.cache.seedAll.bind(gowonService.cache)();
  }, "Seeded cache");
}

function startIntervaledJobs(ctx: GowonContext) {
  return logStartup(async () => {
    intervaledJobsService.start(ctx);
  }, "Started intervaled jobs");
}

async function logStartup(func: () => any, logItem: string): Promise<void> {
  const stopwatch = new Stopwatch();
  stopwatch.start();
  try {
    await Promise.resolve(func());
  } catch (e) {
    console.log(
      chalk`{red ${logItem}${" ".repeat(32 - logItem.length)} FAILED}`
    );
    console.error(e);
    return;
  }
  stopwatch.stop();

  console.log(
    chalk`{white ${logItem}}${" ".repeat(
      32 - logItem.length
    )} {grey ${Math.ceil(stopwatch.elapsedInMilliseconds)} ms}`
  );
}

const asciiArt = `

.d8888b.                                           
d88P  Y88b                                          
888    888                                          
888         .d88b.  888  888  888  .d88b.  88888b.  
888  88888 d88""88b 888  888  888 d88""88b 888 "88b 
888    888 888  888 888  888  888 888  888 888  888 
Y88b  d88P Y88..88P Y88b 888 d88P Y88..88P 888  888 
 "Y8888P88  "Y88P"   "Y8888888P"   "Y88P"  888  888  고원  `;
