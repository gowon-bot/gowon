import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    discordUsername: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ID extends BaseCommand<typeof args> {
  idSeed = "exid hyerin";

  description = "Show your, or another person's discord ID";
  usage = ["", "discord username"];

  arguments: Arguments = args;

  async run() {
    const username = this.parsedArguments.discordUsername;

    let { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
      usernameRequired: false,
    });

    if (username) {
      const user = this.message.guild?.members.cache.find(
        (member) => member.user.username === username
      );

      if (!user)
        this.reply(
          "couldn't find that user. " +
            "Note that username is case sensitive".italic()
        );
      else await this.send(user?.id);
    } else {
      await this.send(discordUser!.id);
    }
  }
}
