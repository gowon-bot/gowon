import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";

export default class Login extends LastFMBaseCommand {
  description = "Logs you into lastfm";
  subcategory = "accounts";
  usage = "username";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    if (!username)
      throw new LogicError(
        `please enter a username (\`${this.gowonService.prefix(
          this.guild.id
        )}login <username>\`)`
      );

    if (await this.lastFMService.userExists(username)) {
      await this.usersService.setUsername(message.author.id, username);

      this.send(`Logged in as ${username.code()}`);
    } else {
      this.reply(`The user ${username?.code()} couldn't be found`);
    }
  }
}
