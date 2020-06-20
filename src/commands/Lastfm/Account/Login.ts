import { Message } from "discord.js";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Login extends LastFMBaseCommand {
  description = "Logs you into lastfm";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    if (await this.lastFMService.userExists(username)) {
      await this.usersService.setUsername(message.author.id, username);

      message.channel.send(`Logged in as \`${sanitizeForDiscord(username)}\``);
    } else {
      message.reply(`The user \`${username}\` couldn't be found`);
    }
  }
}
