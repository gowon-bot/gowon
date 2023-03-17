import { RecordNotFoundError } from "../../../errors/errors";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  username: new StringArgument({ index: 0, slashCommandOption: false }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class LastFMAccount extends LastFMBaseCommand<typeof args> {
  idSeed = "loona kim lip";

  aliases = ["lfm", "link"];
  description = "Links the last.fm profile page for a user";
  subcategory = "accounts";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { username, perspective } = await this.getMentions({
      usernameArgumentKey: "username",
    });

    if (!(await this.lastFMService.doesUserExist(this.ctx, username))) {
      throw new RecordNotFoundError("user");
    }

    const link = LastfmLinks.userPage(username);

    await this.send(`${perspective.upper.possessive} profile: ${link}`);
  }
}
