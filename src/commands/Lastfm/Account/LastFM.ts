import { Arguments } from "../../../lib/arguments/arguments";
import { LinkGenerator } from "../../../helpers/lastFM";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RecordNotFoundError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class LastFMAccount extends LastFMBaseCommand {
  aliases = ["lfm"];
  description = "Links the last.fm profile page for a user";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = {
    inputs: {
      username: { index: 0 },
    },
    mentions: standardMentions,
  };

  async run() {
    let { username, perspective } = await this.parseMentions({
      inputArgumentName: "username",
    });

    if (!(await this.lastFMService.userExists(username)))
      throw new RecordNotFoundError("user");

    let link = LinkGenerator.userPage(username);

    await this.send(`${perspective.upper.possessive} profile: ${link}`);
  }
}
