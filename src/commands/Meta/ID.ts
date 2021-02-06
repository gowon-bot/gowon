import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";

const args = {
  inputs: {
    username: { index: { start: 0 } },
  },
  mentions: {},
} as const;

export default class ID extends BaseCommand<typeof args> {
  idSeed = "exid hyerin";

  description = "Show your, or another person's discord ID";
  usage = ["", "discord username"];

  arguments: Arguments = args;

  async run() {
    const username = this.parsedArguments.username;

    if (!username) {
      await this.send(this.author.id);
    } else {
      const user = this.message.guild?.members.cache.find(
        (member) => member.user.username === username
      );

      if (!user)
        this.reply(
          "couldn't find that user. " +
            "Note that username is case sensitive".italic()
        );
      else await this.send(user?.id);
    }
  }
}
