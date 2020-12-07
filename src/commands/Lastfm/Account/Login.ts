import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { UserInfo } from "../../../services/LastFM/LastFMService.types";
import { differenceInDays, fromUnixTime } from "date-fns";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LogicError } from "../../../errors";

export default class Login extends LastFMBaseCommand {
  idSeed = "loona jinsoul";

  description = "Sets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "username";

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
    mentions: {
      user: { index: 0 },
      userID: { mention: new DiscordIDMention(true), index: 0 },
    },
  };

  validation: Validation = {
    username: new validators.Required({
      message: `please enter a username (\`login <username>\`)`,
    }),
  };

  async run(message: Message) {
    let username = this.parsedArguments.username as string;

    let { discordUser } = await this.parseMentions({ fetchDiscordUser: true });

    if (
      discordUser &&
      discordUser.id !== this.author.id &&
      !this.message.member?.hasPermission("ADMINISTRATOR")
    ) {
      throw new LogicError(
        "you are not able to set usernames for other users!"
      );
    }

    if (username === "<username>") {
      await this.reply(
        "hint: you're supposed to replace <username> with your username".italic()
      );
      return;
    }

    let userInfo: UserInfo | undefined;

    try {
      userInfo = await this.lastFMService.userInfo({ username });

      await this.usersService.setUsername(
        (discordUser || message.author).id,
        userInfo.name
      );

      let joined = fromUnixTime(userInfo.registered.unixtime.toInt());

      this.send(
        `Logged in as ${userInfo.name.code()}${
          differenceInDays(new Date(), joined) < 10
            ? ". Welcome to Last.fm!"
            : ""
        }`
      );
    } catch {
      this.reply(`The user ${username?.code()} couldn't be found`);
    }
  }
}
