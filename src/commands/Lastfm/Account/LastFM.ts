import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LinkGenerator } from "../../../helpers/lastFM";
import { ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class LastFM extends LastFMBaseCommand {
  aliases = ["lfm"];
  description = "Links the last.fm profile page for a user";

  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to lookup" }
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
