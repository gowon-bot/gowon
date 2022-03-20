import { code } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
};

export default class Whoami extends LastFMBaseCommand<typeof args> {
  idSeed = "loona yves";

  aliases = ["me", "whoareyou"];
  description =
    "Displays your Last.fm username, or if you mention another user, theirs";
  subcategory = "accounts";
  usage = ["", "@user"];

  arguments = args;

  async run() {
    let { username, discordUser: user } = await this.getMentions({
      fetchDiscordUser: true,
    });

    let perspective = this.usersService.discordPerspective(this.author, user);

    this.oldReply(`${perspective.plusToBe} logged in as ${code(username)}.`);
  }
}
