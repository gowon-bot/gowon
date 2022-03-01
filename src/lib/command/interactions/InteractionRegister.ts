import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../../config.json";
import { BaseCommand } from "../BaseCommand";
import { SlashCommandConverter } from "./SlashCommandConverter";

export class InteractionRegister {
  private discord!: REST;
  private converter = new SlashCommandConverter();

  init() {
    this.discord = new REST({ version: "9" }).setToken(config.discordToken);
  }

  constructor() {}

  async register(commands: BaseCommand[]) {
    const convertedCommands = [] as SlashCommandBuilder[];

    for (const command of commands) {
      try {
        convertedCommands.push(this.converter.convert(command));
      } catch (e) {
        console.log(e);
      }
    }

    try {
      await this.discord.put(
        Routes.applicationCommands(config.discordClientID),
        {
          body: convertedCommands.map((c) => c.toJSON()),
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
}
