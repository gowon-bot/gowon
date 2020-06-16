import { BaseCommand } from "../../BaseCommand";
import { Message, User } from "discord.js";
import { sanitizeForDiscord } from "../../helpers/discord";
import { Arguments } from "../../arguments";

export default class Whoami extends BaseCommand {
  aliases = ["me"];
  description = "Displays your login";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
  };

  async run(message: Message) {
    let user = this.parsedArguments.user as User;

    let { username } = await this.parseMentionedUsername(message);

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    message.reply(
      `${perspective.plusToBe} logged in as \`${sanitizeForDiscord(
        username
      )}\`.`
    );
  }
}
