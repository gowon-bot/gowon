import { Arguments } from "../../../lib/arguments/arguments";
import { LinkGenerator } from "../../../helpers/lastFM";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RecordNotFoundError } from "../../../errors";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    username: { index: 0 },
  },
  mentions: standardMentions,
} as const;

export default class LastFMAccount extends LastFMBaseCommand<typeof args> {
  idSeed = "loona kim lip";

  aliases = ["lfm", "link"];
  description = "Links the last.fm profile page for a user";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run() {
    let { username, perspective } = await this.getMentions({
      inputArgumentName: "username",
    });

    if (!(await this.lastFMService.userExists(this.ctx, username)))
      throw new RecordNotFoundError("user");

    let link = LinkGenerator.userPage(username);

    await this.send(`${perspective.upper.possessive} profile: ${link}`);
  }
}
