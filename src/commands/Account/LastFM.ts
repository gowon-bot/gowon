import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { LinkGenerator } from "../../helpers/lastFM";
import { ucFirst } from "../../helpers";

export default class LastFM extends BaseCommand {
  aliases = ["lfm"];
  description = "Links the last.fm profile page for a user";

  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to look up" },
    },
  };

  async run(message: Message) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let link = LinkGenerator.userPage(username);

    await message.channel.send(
      `${ucFirst(perspective.possessive)} profile: ${link}`
    );
  }
}
