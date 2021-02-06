import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";

const args = {
  mentions: standardMentions,
} as const;

export default class ID extends BaseCommand<typeof args> {
  idSeed = "exid hyerin";

  description = "Show your, or another person's discord ID";
  usage = ["", "discord username"];

  arguments: Arguments = args;

  async run() {
    let { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
      usernameRequired: false,
    });

    await this.send(discordUser!.id);
  }
}
