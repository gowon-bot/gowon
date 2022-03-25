import { Command } from "../../lib/command/Command";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";

const args = {
  ...standardMentions,
} as const;

export default class ID extends Command<typeof args> {
  idSeed = "exid hyerin";

  subcategory = "developer";
  description = "Show your, or another person's discord ID";
  usage = ["", "discord username"];

  arguments = args;

  async run() {
    let { discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      usernameRequired: false,
    });

    await this.send(discordUser!.id);
  }
}
