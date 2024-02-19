import { code } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { InfoEmbed } from "../../../lib/ui/embeds/InfoEmbed";
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
    const { username, discordUser: user } = await this.getMentions({
      fetchDiscordUser: true,
    });

    const perspective = this.usersService.discordPerspective(this.author, user);

    const embed = new InfoEmbed().setDescription(
      `${perspective.upper.plusToBe} logged in as ${code(username)}.`
    );

    this.reply(embed);
  }
}
