import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

export default class Next extends AuthenticatedSpotifyBaseCommand {
  idSeed = "billlie haruna";

  description = "Skips a song in Spotify";
  aliases = ["skip"];

  async run() {
    const { dbUser } = await this.getMentions({ fetchSpotifyToken: true });

    this.access.checkAndThrow(dbUser);

    await this.spotifyService.next(this.ctx);

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Spotify skip"))
        .setDescription("Successfully skipped!")
    );
  }
}
