import { Message } from "discord.js";
import {
  NoAlbumsFoundInSearchError,
  NoTracksFoundInSearchError,
} from "../../errors/lastfm";
import { GowonContext } from "../../lib/context/Context";
import { Payload } from "../../lib/context/Payload";
import { BaseService } from "../BaseService";
import { RedirectsService } from "../dbservices/RedirectsService";
import { NowPlayingEmbedParsingService } from "../NowPlayingEmbedParsingService";
import { ServiceRegistry } from "../ServicesRegistry";
import { RecentTrack } from "./converters/RecentTracks";
import { Requestable } from "./LastFMAPIService";
import { LastFMService } from "./LastFMService";

export type LastFMArgumentsMutableContext = {
  nowplaying?: RecentTrack;
  parsedNowplaying?: RecentTrack;
};

export type LastFMArgumentsContext = GowonContext<{
  mutable?: LastFMArgumentsMutableContext;
}>;

type LastFMArgumentsOptions = Partial<{
  redirect: boolean;
  noSearch: boolean;
  noParse: boolean;
}>;

export class LastFMArguments extends BaseService<LastFMArgumentsContext> {
  private get redirectsService() {
    return ServiceRegistry.get(RedirectsService);
  }
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }
  private get nowPlayingEmbedParsingService() {
    return ServiceRegistry.get(NowPlayingEmbedParsingService);
  }

  async getArtist(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions = {}
  ): Promise<string> {
    let artist = this.parsedArguments(ctx).artist as string;

    if (!artist) {
      artist = (await this.getNowPlaying(ctx, requestable, options)).artist;
    } else if (options.redirect) {
      artist =
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist;
    }

    return artist;
  }

  async getAlbum(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions = {}
  ): Promise<{ artist: string; album: string }> {
    let artist = this.parsedArguments(ctx).artist as string,
      album = this.parsedArguments(ctx).album as string;

    // This means that the user has not included a `|` in their message
    if (artist && album === undefined) {
      if (options.noSearch) return { artist, album };

      const albumSearch = await this.lastFMService.albumSearch(ctx, {
        album: artist,
      });
      const albumSearchResult = albumSearch.albums[0];

      if (!albumSearchResult) throw new NoAlbumsFoundInSearchError(artist);

      return {
        artist: albumSearchResult.artist,
        album: albumSearchResult.name,
      };
    }

    if (!artist || !album) {
      const nowPlaying = await this.getNowPlaying(ctx, requestable, options);

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    } else if (artist && options.redirect) {
      artist =
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist;
    }

    return { artist, album };
  }

  async getTrack(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions = {}
  ): Promise<{ artist: string; track: string }> {
    let artist = this.parsedArguments(ctx).artist as string,
      track = this.parsedArguments(ctx).track as string;

    if (artist && track === undefined) {
      if (options.noSearch) return { artist, track };

      const trackSearch = await this.lastFMService.trackSearch(ctx, {
        track: artist,
      });
      const trackSearchResult = trackSearch.tracks[0];

      if (!trackSearchResult) throw new NoTracksFoundInSearchError(artist);

      return {
        artist: trackSearchResult.artist,
        track: trackSearchResult.name,
      };
    }

    if (!artist || !track) {
      const nowPlaying = await this.getNowPlaying(ctx, requestable, options);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    } else if (artist && options.redirect) {
      artist =
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist;
    }

    return { artist, track };
  }

  private parsedArguments(ctx: LastFMArgumentsContext): any {
    return ctx.command.parsedArguments as any;
  }

  private async getNowPlaying(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions
  ): Promise<RecentTrack> {
    const originalPayload = ctx.command.payload;

    if (
      !options.noParse &&
      originalPayload.isMessage() &&
      originalPayload.source.reference
    ) {
      const parsedNowplaying = await this.parseEmbed(ctx, originalPayload);

      if (parsedNowplaying) return parsedNowplaying;
    }

    const nowplaying = await this.lastFMService.nowPlaying(ctx, requestable);

    ctx.mutable.nowplaying = nowplaying;

    return nowplaying;
  }

  private async parseEmbed(
    ctx: LastFMArgumentsContext,
    originalPayload: Payload<Message>
  ) {
    const reply = await originalPayload.source.fetchReference();
    const embed = reply.embeds[0];

    let parsedNowplaying: RecentTrack | undefined = undefined;

    if (this.nowPlayingEmbedParsingService.hasParsableGowonEmbed(ctx, reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseGowonEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableFmbotEmbed(ctx, reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseFmbotEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableChuuEmbed(ctx, reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseChuuEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableWhoKnowsEmbed(ctx, reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseWhoKnowsEmbed(embed);

    ctx.mutable.parsedNowplaying = parsedNowplaying;

    return parsedNowplaying;
  }
}
