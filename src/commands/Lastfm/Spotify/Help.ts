import { displayLink } from "../../../lib/views/displays";
import { SpotifyChildCommand } from "./SpotifyChildCommand";

export class Help extends SpotifyChildCommand {
  idSeed = "viviz eunha";

  description = "Control what Spotify information Gowon shows";
  aliases = ["help", "spotifyhelp", "shelp"];
  usage = ["public", "private"];

  async run() {
    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Spotify help")
    ).setDescription(`
You can see a list of all Spotify commands at ${displayLink(
      "gowon.ca/commands/spotify",
      "https://gowon.ca/commands/spotify"
    )}.

To change your Spotify privacy, see \`${this.prefix}sprivacy\`
To see help for managing Spotify playlists, see \`${this.prefix}help pl\`
`);

    await this.send(embed);
  }
}
