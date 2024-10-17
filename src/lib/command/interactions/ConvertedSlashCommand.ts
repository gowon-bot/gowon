import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { SlashCommandBuilder } from "../../context/arguments/argumentTypes/SlashCommandTypes";

export class ConvertedSlashCommand {
  private isUserInstallable = false;

  constructor(private builder: SlashCommandBuilder) {}

  public toJSON(): RESTPostAPIApplicationCommandsJSONBody {
    const json = this.builder.toJSON();

    if (this.isUserInstallable) {
      // Type is outdated
      (json as any).integration_types = [0, 1];
      (json as any).contexts = [0, 1, 2];
    }

    return json;
  }

  public setUserInstallable(toggle: boolean): this {
    this.isUserInstallable = toggle;
    return this;
  }
}
