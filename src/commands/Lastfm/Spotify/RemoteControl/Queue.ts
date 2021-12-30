import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class Queue extends AuthenticatedSpotifyBaseCommand<
  typeof args
> {
  idSeed = "dreamnote lara";

  description = "Queues a song in Spotify";
  aliases = ["q"];

  arguments: Arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const track = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      throw new LogicError("Couldn't find a track to queue!");
    }

    await this.spotifyService.queue(this.ctx, track.uri.asString);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Spotify queue song"))
      .setDescription(
        `Succesfully queued:
${track.name.italic()} by ${track.artists.primary.name.strong()}!`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
