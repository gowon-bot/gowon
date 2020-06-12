import { BaseCommand } from "../BaseCommand";
import { Message } from "discord.js";
import { sanitizeForDiscord } from "../helpers/discord";
import { Arguments } from "../arguments";

export class Login extends BaseCommand {
  description = "Logs you into lastfm";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    await this.usersService.setUsername(message.author.id, username);

    message.channel.send(`Logged in as \`${sanitizeForDiscord(username)}\``);
  }
}
