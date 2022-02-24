import { LogicError } from "../../../../errors";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

const args = {
  ...prefabArguments.track,
} as const;

export default class Queue extends AuthenticatedSpotifyBaseCommand<
  typeof args
> {
  idSeed = "billlie siyoon";

  description = "Queues a song in Spotify";
  aliases = ["q"];

  arguments = args;

  async run() {
    const { senderRequestable, dbUser } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    this.access.checkAndThrow(dbUser);

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
