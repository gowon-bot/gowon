import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { User } from "../../database/entity/User";
import { LastFMError, TrackDoesNotExistError } from "../../errors/errors";
import { bold, italic, subsubheader } from "../../helpers/discord";
import { Variation } from "../../lib/command/Command";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
import { SettingsService } from "../../lib/settings/SettingsService";
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

  settingsService = ServiceRegistry.get(SettingsService);
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

    const trackInfo = await this.getTrackInfo({
      artist,
      track,
      username: senderRequestable,
    });

    const { cachedLovedTrack, removedCachedLovedTrack } =
      await this.loveOrUnlove(
        senderUser!,
        { artist, track, username: senderRequestable },
        trackInfo
      );

    const title = this.getTitle(
      trackInfo,
      cachedLovedTrack,
      removedCachedLovedTrack
    );

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

    const embed = this.minimalEmbed()
      .setTitle(title)
      .setDescription(
        `${subsubheader(trackInfo?.name || track)}
        
by ${bold(trackInfo?.artist.name || artist)}${
          album ? ` from ${italic(album)}` : ""
        }`
      );

    if (image) embed.setThumbnail(albumCover || "");

    await this.reply(embed);
  }

  private async loveOrUnlove(
    dbUser: User,
    params: TrackLoveParams,
    trackInfo?: TrackInfo
  ): Promise<{
    cachedLovedTrack?: CachedLovedTrack;
    removedCachedLovedTrack?: CachedLovedTrack;
  }> {
    if (this.variationWasUsed(Variations.Unlove)) {
      return {
        removedCachedLovedTrack: await this.lovedTrackService.unlove(
          this.ctx,
          params,
          dbUser
        ),
      };
    } else {
      const mutableContext =
        this.ctx.getMutable<LastFMArgumentsMutableContext>();

      if (
        trackInfo ||
        mutableContext.nowplaying ||
        mutableContext.parsedNowplaying
      ) {
        return {
          cachedLovedTrack: await this.lovedTrackService.love(this.ctx, {
            params,
            dbUser,
            shouldCache: !trackInfo,
          }),
        };
      } else if (
        !trackInfo &&
        !mutableContext.nowplaying &&
        !mutableContext.parsedNowplaying
      ) {
        throw new TrackDoesNotExistError();
      }
    }

    return {};
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
    cachedLovedTrack: CachedLovedTrack | undefined,
    removedCachedLovedTrack: CachedLovedTrack | undefined
  ): string {
    const unlove = this.variationWasUsed(Variations.Unlove);

    const wasAlreadyLoved =
      trackInfo?.loved || (cachedLovedTrack && !cachedLovedTrack.new);
    const wasAlreadyUnloved =
      (trackInfo && !trackInfo.loved) ||
      (!trackInfo && !removedCachedLovedTrack);

    return unlove
      ? wasAlreadyUnloved
        ? `Track already not loved! ${Emoji.mendingHeart}`
        : `Unloved! ${Emoji.brokenHeart}`
      : !wasAlreadyLoved
      ? `Loved! ${this.settingsService.get("fmLovedEmoji", {
          userID: this.author.id,
        })}`
      : `Track already loved! ${Emoji.revolvingHearts}`;
  }
}
