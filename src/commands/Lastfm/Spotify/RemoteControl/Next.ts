import { SpotifyChildCommand } from "../SpotifyChildCommand";

export class Next extends SpotifyChildCommand {
  idSeed = "billlie haruna";

  description = "Skips a song in Spotify";
  aliases = ["skip", "snext", "sskip"];

  async run() {
    await this.getMentions({ fetchSpotifyToken: true });

    await this.spotifyService.next(this.ctx);

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Spotify skip"))
        .setDescription("Successfully skipped!")
    );
  }
}
