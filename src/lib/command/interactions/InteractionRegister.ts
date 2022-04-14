import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../../config.json";
import { Command } from "../Command";
import { SlashCommandConverter } from "./SlashCommandConverter";

export class InteractionRegister {
  private discord!: REST;
  private converter = new SlashCommandConverter();

  init() {
    this.discord = new REST({ version: "9" }).setToken(config.discordToken);
  }

  constructor() {}

  async register(commands: Command[]) {
    const convertedCommands = [] as SlashCommandBuilder[];

    for (const command of commands) {
      try {
        convertedCommands.push(...this.converter.convert(command));
      } catch (e) {
        console.log(e);
      }
    }

    await this.registerWithDiscord(convertedCommands);
  }

  private async registerWithDiscord(commands: SlashCommandBuilder[]) {
    try {
      if (config.environment === "development") {
        await this.clearApplicationCommands();
      }

      await this.discord.put(
        config.environment === "development"
          ? Routes.applicationGuildCommands(
              config.discordClientID,
              config.slashCommandTestGuildID
            )
          : Routes.applicationCommands(config.discordClientID),
        {
          body: commands.map((c) => c.toJSON()),
        }
      );
    } catch (e) {
      console.log(e);
    }
  }

  private async clearApplicationCommands() {
    const commands = (await this.discord.get(
      Routes.applicationCommands(config.discordClientID)
    )) as [{ id: string }];

    for (const command of commands) {
      const deleteUrl = `${Routes.applicationCommands(
        config.discordClientID
      )}/${command.id}`;

      await this.discord.delete(deleteUrl as `/${string}`);
    }
  }
}
