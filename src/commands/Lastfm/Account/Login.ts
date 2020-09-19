import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export default class Login extends LastFMBaseCommand {
  description = "Logs you into lastfm";
  subcategory = "accounts";
  aliases = ["fmset"];
  usage = "username";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
  };

  validation: Validation = {
    username: new validators.Required({
      message: `please enter a username (\`login <username>\`)`,
    }),
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    if (await this.lastFMService.userExists(username)) {
      await this.usersService.setUsername(message.author.id, username);

      this.send(`Logged in as ${username.code()}`);
    } else {
      this.reply(`The user ${username?.code()} couldn't be found`);
    }
  }
}
