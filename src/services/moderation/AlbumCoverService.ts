import { ILike, IsNull } from "typeorm";
import { AlternateAlbumCover } from "../../database/entity/AlternateAlbumCover";
import { User } from "../../database/entity/User";
import {
  AlternateCoverAlreadyDoesNotExist,
  AlternateCoverURLCannotBeBlankError,
} from "../../errors/contentModeration";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyService } from "../Spotify/SpotifyService";
import { SpotifyImage } from "../Spotify/SpotifyService.types";

interface AlbumCoverGetOptions {
  metadata?: { artist: string; album: string };
  enlarge?: boolean;
  dontFetchSpotifyFallback?: boolean;
  moderation?: boolean;
}

export interface AlbumCoverWithDetails {
  url: string | undefined;
  source: "lastfm" | "moderation" | "custom" | "spotify";
  fileExtension: string;
}

export class AlbumCoverService extends BaseService {
  private get spotifyService() {
    return ServiceRegistry.get(SpotifyService);
  }

  public readonly noCover = "";
  private readonly defaultCoverFilename =
    "2a96cbd8b46e442fc41c2b86b821562f.png";
  public readonly defaultCover = `https://lastfm.freetls.fastly.net/i/u/174s/${this.defaultCoverFilename}`;

  public async get(
    ctx: GowonContext,
    url: string | undefined,
    options: AlbumCoverGetOptions = {}
  ): Promise<string | undefined> {
    return (await this.getWithDetails(ctx, url, options)).url;
  }

  public async getWithDetails(
    ctx: GowonContext,
    url: string | undefined,
    options: AlbumCoverGetOptions = {}
  ): Promise<AlbumCoverWithDetails> {
    this.log(ctx, `Fetching album cover for ${url}`);

    if (options.metadata) {
      const alternate = await this.getAlternateCover(
        ctx,
        options.metadata.artist,
        options.metadata.album,
        options.moderation
      );

      const alternateURL = this.processURL(alternate?.url || url, {
        enlarge: options.enlarge,
      });

      if (!alternateURL && !options.dontFetchSpotifyFallback) {
        const spotifyAlbumCover = await this.getSpotifyAlbumCover(
          ctx,
          options.metadata.artist,
          options.metadata.album,
          options.enlarge
        );

        if (spotifyAlbumCover) {
          return {
            url: spotifyAlbumCover.url,
            source: "spotify",
            fileExtension: "jpeg",
          };
        }
      }

      return {
        url: alternateURL,
        source: alternate?.setByModerator
          ? "moderation"
          : alternate
          ? "custom"
          : "lastfm",
        fileExtension: this.extractFileExtension(alternateURL),
      };
    }

    return {
      url: this.processURL(url, { enlarge: options.enlarge }),
      source: "lastfm",
      fileExtension: "jpg",
    };
  }

  public async setAlternate(
    ctx: GowonContext,
    artist: string,
    album: string,
    url: string,
    user?: User
  ): Promise<AlternateAlbumCover> {
    this.log(
      ctx,
      `Setting ${url} as an album cover for ${artist} | ${album} (${
        user ? user.discordID : "moderation"
      })`
    );

    const existing = await AlternateAlbumCover.findOne({
      where: {
        artistName: ILike(artist),
        albumName: ILike(album),
        user: !user ? IsNull() : user,
      },
    });

    if (existing) {
      existing.url = url;
      return await existing.save();
    } else if (!url) {
      throw new AlternateCoverURLCannotBeBlankError();
    }

    const albumCover = AlternateAlbumCover.create({
      artistName: artist,
      albumName: album,
      user,
      url,
    });

    return await albumCover.save();
  }

  public async clearAlternate(
    ctx: GowonContext,
    artist: string,
    album: string,
    user?: User
  ) {
    this.log(
      ctx,
      `Clearing the alternate album cover for ${artist} | ${album} (${
        user ? user.discordID : "moderation"
      })`
    );

    const existing = await AlternateAlbumCover.findOne({
      where: {
        artistName: ILike(artist),
        albumName: ILike(album),
        user: !user ? IsNull() : user,
      },
    });

    if (!existing) {
      throw new AlternateCoverAlreadyDoesNotExist();
    }

    return await existing.remove();
  }

  public enlargeLastFMImage(url: string, size = "2048") {
    return url.replace(/\d+x\d+/, `${size}x${size}`);
  }

  public async getAlternateCover(
    ctx: GowonContext,
    artist: string,
    album: string,
    moderation?: boolean
  ): Promise<AlternateAlbumCover | undefined> {
    const where = { artistName: ILike(artist), albumName: ILike(album) };

    const user = User.findOne({ where: { discordID: ctx.author.id } });

    const whereUser = { ...where, user };
    const whereMod = { ...where, user: IsNull() };

    const albumCover = await AlternateAlbumCover.find({
      where:
        moderation === false
          ? whereUser
          : moderation === true
          ? whereMod
          : [whereUser, whereMod],
    });

    // Return the album cover set by moderators over the album cover set by a user
    return albumCover.length > 1
      ? albumCover.find((ac) => ac.user === null)
      : albumCover[0];
  }

  public async getSpotifyAlbumCover(
    ctx: GowonContext,
    artist: string,
    album: string,
    getLargest?: boolean
  ): Promise<SpotifyImage | undefined> {
    const spotifyAlbumSearch = await this.spotifyService.searchAlbum(ctx, {
      artist,
      album,
    });

    if (
      spotifyAlbumSearch.hasAnyResults &&
      spotifyAlbumSearch.bestResult.isExactMatch
    ) {
      return getLargest
        ? spotifyAlbumSearch.bestResult.images.getLargest(1)
        : spotifyAlbumSearch.bestResult.images.getLargest(2);
    }

    return undefined;
  }

  private processURL(
    url: string | undefined,
    options: { enlarge?: boolean } = {}
  ): string | undefined {
    if (!url || this.isDefault(url)) {
      return undefined;
    }

    if (
      options.enlarge &&
      url.startsWith("https://lastfm.freetls.fastly.net/i/u")
    ) {
      return this.enlargeLastFMImage(url);
    }

    return url;
  }

  private isDefault(url: string): boolean {
    return url.endsWith("2a96cbd8b46e442fc41c2b86b821562f.png");
  }

  private extractFileExtension(url?: string): string {
    if (!url) return "";

    const fileEndingSplit = url.split(".");

    return fileEndingSplit[fileEndingSplit.length - 1];
  }
}
