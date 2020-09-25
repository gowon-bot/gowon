import { Arguments } from "../../../lib/arguments/arguments";
import { LinkGenerator } from "../../../helpers/lastFM";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RecordNotFoundError } from "../../../errors";

export default class LastFM extends LastFMBaseCommand {
  aliases = ["lfm"];
  description = "Links the last.fm profile page for a user";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      username: { index: 0 },
    },
  };

  async run() {
    let { username, perspective } = await this.parseMentionedUsername({
      inputArgumentName: "username",
    });

    if (!(await this.lastFMService.userExists(username)))
      throw new RecordNotFoundError("user");

    let link = LinkGenerator.userPage(username);

    await this.send(`${perspective.upper.possessive} profile: ${link}`);
  }
}
