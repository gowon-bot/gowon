import { LogicError } from "../../../../errors/errors";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { SpotifyChildCommand } from "../SpotifyChildCommand";

const args = {
  ...prefabArguments.track,
} as const;

export class Queue extends SpotifyChildCommand<typeof args> {
  idSeed = "billlie siyoon";

  description = "Queues a song in Spotify";
  aliases = ["q", "sq", "squeue"];

  arguments = args;

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
