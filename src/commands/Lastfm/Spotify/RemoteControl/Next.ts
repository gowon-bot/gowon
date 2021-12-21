import { Arguments } from "../../../../lib/arguments/arguments";
import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

const args = {} as const;

export default class Next extends AuthenticatedSpotifyBaseCommand<typeof args> {
  idSeed = "dreamnote habin";

  description = "Skips a song in Spotify";
  aliases = ["skip"];

  arguments: Arguments = args;

  async run() {
    await this.getMentions({ fetchSpotifyToken: true });

    await this.spotifyService.next(this.ctx);

    await this.send(
      this.newEmbed()
        .setAuthor(...this.generateEmbedAuthor("Spotify skip"))
        .setDescription("Successfully skipped!")
    );
  }
}
