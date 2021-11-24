import { Arguments } from "../../../../lib/arguments/arguments";
import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

const args = {} as const;

export default class Queue extends AuthenticatedSpotifyBaseCommand<
  typeof args
> {
  idSeed = "dreamnote lara";

  description = "Queues a song in Spotify";
  aliases = ["q"];

  arguments: Arguments = args;

  async run() {
    await this.fetchToken();

    const replied = await this.getRepliedMessage();

    if (replied) {
      if (this.containsSpotifyLink(replied?.content)) {
        const uri = this.getSpotifyTrackURI(replied.content);
        const id = this.spotifyService.getIDFromURI(uri);

        const [track] = await Promise.all([
          await this.spotifyService.getTrack(this.ctx, id),
          await this.spotifyService.queue(this.ctx, uri),
        ]);

        const embed = this.newEmbed()
          .setAuthor(...this.generateEmbedAuthor("Spotify queue song"))
          .setDescription(
            `Succesfully queued ${track.name.italic()} by ${track.artists[0].name.strong()}!`
          )
          .setThumbnail(track.album.images[0].url);

        await this.send(embed);
      }
    }
  }
}
