import config from "../config.json";

import chalk from "chalk";
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import gql from "graphql-tag";
import { GraphQLAPI } from "./api";
import { DB } from "./database/DB";
import { Stopwatch, ucFirst } from "./helpers";
import { GowonClient } from "./lib/GowonClient";
import { CommandHandler } from "./lib/command/CommandHandler";
import {
  CommandRegistry,
  generateRunnables,
} from "./lib/command/CommandRegistry";
import { InteractionHandler } from "./lib/command/interactions/InteractionHandler";
import { InteractionReplyRegistry } from "./lib/command/interactions/InteractionReplyRegistry";
import { mirrorballClient } from "./lib/indexing/client";
import { SettingsService } from "./lib/settings/SettingsService";
import { GuildEventService } from "./services/Discord/GuildEventService";
import { GowonService } from "./services/GowonService";
import { ServiceRegistry } from "./services/ServicesRegistry";
import { RedisInteractionService } from "./services/redis/RedisInteractionService";

export const client = new GowonClient(
  new Client({
    // List of intents: https://discord.com/developers/docs/topics/gateway#list-of-intents
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.MessageContent,
    ],
    presence: {
      status: "online",
      activities: [
        {
          name: "One & Only",
          type: ActivityType.Listening,
          url: "https://gowon.ca",
        },
      ],
    },
    allowedMentions: { parse: ["users", "roles"] },
    partials: [Partials.Channel],
  }),
  config.environment
);

export const handler = new CommandHandler();
export const interactionHandler = new InteractionHandler();
const db = new DB();
const api = new GraphQLAPI(client);
const settingsService = ServiceRegistry.get(SettingsService);
const redisService = ServiceRegistry.get(RedisInteractionService);
export const guildEventService = ServiceRegistry.get(GuildEventService);

export async function setup() {
  console.log(
    chalk`{cyan ${
      asciiArt + "\n" + "=".repeat(asciiArt.split("\n").reverse()[0].length)
    }}\n{yellow -${ucFirst(config.environment)}-}\n`
  );

  await Promise.all([
    connectToDB(),
    connectToRedis(),
    connectToMirrorball(),
    intializeAPI(),
    initializeCommandRegistry(),
  ]);

  // These depend on other initilzations above
  await Promise.all([
    // SettingsManager needs the database to be connected to cache settings
    initializeSettingsManager(),
    // The interaction handler depends on the command registry
    initializeInteractions(),
    // GowonCache needs to the database to be initialized
    seedCache(),
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

function initializeCommandRegistry() {
  return logStartup(async () => {
    const { commands, interactionReplies } = await generateRunnables();

    CommandRegistry.getInstance().init(commands);
    InteractionReplyRegistry.getInstance().init(interactionReplies);
  }, "Initialized command registry");
}

function seedCache() {
  return logStartup(async () => {
    const gowonService = ServiceRegistry.get(GowonService);

    await gowonService.cache.seedAll.bind(gowonService.cache)();
  }, "Seeded cache");
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
