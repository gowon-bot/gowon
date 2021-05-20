import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { differenceInDays } from "date-fns";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LogicError } from "../../../errors";
import { UserInfo } from "../../../services/LastFM/converters/InfoTypes";

const args = {
  inputs: {
    username: { index: 0 },
  },
  mentions: {
    user: { index: 0 },
    userID: { mention: new DiscordIDMention(true), index: 0 },
  },
} as const;

export default class SimpleLogin extends LastFMBaseCommand<typeof args> {
  idSeed = "loona jinsoul";

  shouldBeIndexed = false;

  description = "Sets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "username";

  arguments: Arguments = args;

  validation: Validation = {
    username: new validators.Required({
      message: `please enter a last.fm username (\`login <username>\`)`,
    }),
  };

  async run(message: Message) {
    let username = this.parsedArguments.username!;

    let { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      usernameRequired: false,
    });

    if (
      discordUser &&
      discordUser.id !== this.author.id &&
      !this.message.member?.permissions?.has("ADMINISTRATOR")
    ) {
      throw new LogicError(
        "you are not able to set usernames for other users!"
      );
    }

    if (username === "<username>") {
      await this.traditionalReply(
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

      this.send(
        `Logged in as ${userInfo.name.code()}${
          differenceInDays(new Date(), userInfo.registeredAt) < 10
            ? ". Welcome to Last.fm!"
            : ""
        }`
      );
    } catch {
      this.sendError(`The user ${username?.code()} couldn't be found`);
    }
  }
}
