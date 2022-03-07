import { LinkGenerator } from "../../../helpers/lastFM";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RecordNotFoundError } from "../../../errors/errors";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";

const args = {
  username: new StringArgument({ index: 0, slashCommandOption: false }),
  ...standardMentions,
} as const;

export default class LastFMAccount extends LastFMBaseCommand<typeof args> {
  idSeed = "loona kim lip";

  aliases = ["lfm", "link"];
  description = "Links the last.fm profile page for a user";
  subcategory = "accounts";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

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
