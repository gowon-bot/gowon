import { Message } from "discord.js";
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
      await this.usersService.setUsername(message.author.id, message.guild?.id!, username);

      message.channel.send(`Logged in as ${username.code()}`);
    } else {
      message.reply(`The user ${username.code()} couldn't be found`);
    }
  }
}
