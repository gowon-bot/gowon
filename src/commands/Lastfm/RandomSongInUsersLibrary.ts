import { getOrdinal } from "../../helpers";
import { bold, italic } from "../../helpers/discord";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { TrackInfo } from "../../services/LastFM/converters/InfoTypes";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...standardMentions,
  poolAmount: new NumberArgument(),
} satisfies ArgumentsMap;

export default class RandomsongInUsersLibrary extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "april yena";

  shouldBeIndexed = false;

  arguments = args;

  validation: Validation = {
    poolAmount: {
      validator: new validators.RangeValidator({ min: 10 }),
      friendlyName: "pool amount",
    },
  };

  async run() {
    const poolAmount = this.parsedArguments.poolAmount;

    const { requestable, username } = await this.getMentions();

    const trackCount = await this.lastFMService.trackCount(
      this.ctx,
      requestable
    );

    const bound =
      poolAmount && poolAmount < trackCount ? poolAmount : trackCount / 2;

    let randomIndex = Math.floor(Math.random() * (bound - 1));

    randomIndex = randomIndex < 0 ? 0 : randomIndex;

    const randomSong = (
      await this.lastFMService.topTracks(this.ctx, {
        username: requestable,
        limit: 1,
        page: randomIndex,
      })
    ).tracks[0];

    let trackInfo: TrackInfo | undefined = undefined;

    try {
      trackInfo = await this.lastFMService.trackInfo(this.ctx, {
        track: randomSong.name,
        artist: randomSong.artist.name,
      });
    } catch { }

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      trackInfo?.album?.images.get("large"),
      trackInfo?.album
        ? {
          metadata: {
            artist: trackInfo.artist.name,
            album: trackInfo.album.name,
          },
        }
        : {}
    );

    const embed = this.newEmbed()
      .setAuthor({
        name: `${username}'s ${getOrdinal(randomIndex - 1)} top track`,
      })
      .setTitle(randomSong.name)
      .setDescription(
        `by ${bold(randomSong.artist.name)}` +
        (trackInfo?.album ? ` from ${italic(trackInfo.album.name)}` : "")
      )
      .setThumbnail(albumCover || "");

    await this.send(embed);
  }
}
