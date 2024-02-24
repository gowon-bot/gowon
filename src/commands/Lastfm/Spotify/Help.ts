import { displayLink } from "../../../lib/ui/displays";
import { HelpEmbed } from "../../../lib/ui/embeds/HelpEmbed";
import { SpotifyChildCommand } from "./SpotifyChildCommand";

export class Help extends SpotifyChildCommand {
  idSeed = "viviz eunha";

  description = "See help about Gowon's Spotify integration";
  aliases = ["help", "spotifyhelp", "shelp"];
  usage = ["public", "private"];

  async run() {
    const embed = new HelpEmbed().setHeader("Help with Spotify")
      .setDescription(`
You can see a list of all Spotify commands at ${displayLink(
      "gowon.bot/commands/spotify",
      "https://gowon.bot/commands/spotify"
    )}.

To connect your Spotify account, run \`${this.prefix}slogin\`
To change your Spotify privacy, see \`${this.prefix}sprivacy\`
To see help for managing Spotify playlists, see \`${this.prefix}help pl\`
`);

    await this.reply(embed);
  }
}
