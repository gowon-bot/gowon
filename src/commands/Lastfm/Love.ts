import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { User } from "../../database/entity/User";
import { LastFMError, TrackDoesNotExistError } from "../../errors/errors";
import { bold, italic } from "../../helpers/discord";
import { Variation } from "../../lib/command/Command";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { LastFMArgumentsMutableContext } from "../../services/LastFM/LastFMArguments";
import {
  TrackInfoParams,
  TrackLoveParams,
} from "../../services/LastFM/LastFMService.types";
import { LovedTrackService } from "../../services/LastFM/LovedTrackService";
import { TrackInfo } from "../../services/LastFM/converters/InfoTypes";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

enum Variations {
  Love = "love",
  Unlove = "unlove",
}

export default class Love extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha i an";

  description = "Loves a track on Last.fm";
  extraDescription = `.\n\nIf you attempt to love a track which doesn't exist through the Last.fm API yet, Gowon will remember this and love it when it becomes available (usually about 1 or 2 days). 

In the meantime, it will appear in your \`!fm\`s as a loved track.`;
  usage = ["", "artist | track"];

  aliases = ["luv", "unfuck"];

  variations: Variation[] = [
    {
      name: Variations.Unlove,
      variation: ["unlove", "hate", "fuck"],
      separateSlashCommand: true,
    },
  ];

  slashCommand = true;

  arguments = args;

  lovedTrackService = ServiceRegistry.get(LovedTrackService);

  async run() {
    const { senderRequestable, senderUser } = await this.getMentions({
      lfmAuthentificationRequired: true,
      dbUserRequired: true,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const mutableContext = this.ctx.getMutable<LastFMArgumentsMutableContext>();

    const np = mutableContext.nowplaying;
    const parsedNp = mutableContext.parsedNowplaying;

    const isNowPlaying =
      (np && np.artist === artist && np.name == track) ||
      (parsedNp && parsedNp.artist === artist && parsedNp.name === track);

    const trackInfo = undefined;
    // await this.getTrackInfo({
    //   artist,
    //   track,
    //   username: senderRequestable,
    // });

    const cachedLovedTrack = await this.loveOrUnlove(
      senderUser!,
      { artist, track, username: senderRequestable },
      trackInfo
    );

    const title = this.getTitle(trackInfo, cachedLovedTrack);

    const image =
      (isNowPlaying
        ? np?.images.get("large") || parsedNp?.images.get("large")
        : trackInfo?.album?.images?.get("large")) ?? undefined;

    const albumName = np?.album || trackInfo?.album?.name;

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      image,
      albumName
        ? {
            metadata: { artist, album: albumName },
          }
        : {}
    );

    const album = isNowPlaying
      ? np?.album || parsedNp?.album
      : trackInfo?.album?.name;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor(title))
      .setTitle(trackInfo?.name || track)
      .setDescription(
        `by ${bold(trackInfo?.artist.name || artist)}${
          album ? ` from ${italic(album)}` : ""
        }`
      )
      .setFooter({
        text:
          cachedLovedTrack && !this.variationWasUsed(Variations.Unlove)
            ? `This track love has been cached, and will be submitted when the track exists on Last.fm. See "${this.prefix}help love" for more info`
            : "",
      });

    if (image) embed.setThumbnail(albumCover || "");

    await this.send(embed);
  }

  private async loveOrUnlove(
    dbUser: User,
    params: TrackLoveParams,
    trackInfo?: TrackInfo
  ): Promise<CachedLovedTrack | undefined | { uncached: boolean }> {
    if (
      this.variationWasUsed(Variations.Unlove) &&
      (!trackInfo || trackInfo.loved)
    ) {
      const { wasCached } = await this.lovedTrackService.unlove(
        this.ctx,
        params,
        dbUser
      );

      return { uncached: wasCached };
    } else if (!trackInfo || !trackInfo.loved) {
      return await this.lovedTrackService.love(this.ctx, params, dbUser);
    }

    return undefined;
  }

  private async getTrackInfo(
    params: TrackInfoParams
  ): Promise<TrackInfo | undefined> {
    try {
      return await this.lastFMService.trackInfo(this.ctx, params);
    } catch (e) {
      if (e instanceof LastFMError && e.response.error === 6) {
        return undefined;
      } else throw e;
    }
  }

  private getTitle(
    trackInfo: TrackInfo | undefined,
    cachedLovedTrack: CachedLovedTrack | { uncached: boolean } | undefined
  ): string {
    const unlove = this.variationWasUsed(Variations.Unlove);

    if ((cachedLovedTrack as any)?.uncached) {
      return `Uncached track love! 💔`;
    } else if (!trackInfo && !unlove) {
      return `Cached track love! ❤️`;
    } else if (!trackInfo && (unlove || !cachedLovedTrack)) {
      throw new TrackDoesNotExistError();
    } else if (trackInfo) {
      return unlove
        ? !trackInfo.loved
          ? "Track already not loved! ❤️‍🩹"
          : "Unloved! 💔"
        : !trackInfo.loved
        ? "Loved! ❤️"
        : "Track already loved! 💞";
    }

    return "";
  }
}
