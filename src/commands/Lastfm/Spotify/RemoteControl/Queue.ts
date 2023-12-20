import { LogicError } from "../../../../errors/errors";
import { bold, italic } from "../../../../helpers/discord";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { SpotifyChildCommand } from "../SpotifyChildCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export class Queue extends SpotifyChildCommand<typeof args> {
  idSeed = "billlie siyoon";

  description = "Queues a song in Spotify";
  aliases = ["q", "sq", "squeue"];
  usage = ["", "artist | song", "(in reply to a Spotify song link)"];

  arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const { track, askedConfirmation } = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      if (askedConfirmation) return;

      throw new LogicError("Couldn't find a track to queue!");
    }

    await this.spotifyService.queue(this.ctx, track.uri.asString);

    const embed = this.authorEmbed()
      .setHeader("Spotify queue song")
      .setDescription(
        `Succesfully queued:
${italic(track.name)} by ${bold(track.artists.primary.name)}!`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
