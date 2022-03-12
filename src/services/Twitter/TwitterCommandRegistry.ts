import { BaseCommand } from "../../lib/command/BaseCommand";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { StreamedTweet } from "./converters/StreamedTweet";
import config from "../../../config.json";

export class TwitterCommandRegistry {
  constructor(private commandRegistry: CommandRegistry) {}

  find(
    options: Partial<{ fromTweet: StreamedTweet }>
  ): BaseCommand | undefined {
    if (options.fromTweet) {
      const commandName = this.getCommandNameFromTweet(options.fromTweet);

      if (!commandName) return;

      const command = this.getCommands().find(
        (c) =>
          c.slashCommandName === commandName ||
          c.name === commandName ||
          c.friendlyName === commandName
      );

      return command;
    }

    return undefined;
  }

  getCommands(): BaseCommand[] {
    return this.commandRegistry.list(true).filter((c) => !!c.twitterCommand);
  }

  private getCommandNameFromTweet(tweet: StreamedTweet): string | undefined {
    const content = tweet.content
      .replaceAll(`@${config.twitterUsername}`, "")
      .trim();

    const [command] = content.split(" ");

    return command;
  }
}
