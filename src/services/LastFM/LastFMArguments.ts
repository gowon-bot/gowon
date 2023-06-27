import { Message } from "discord.js";
import {
  NoAlbumsFoundInSearchError,
  NoTracksFoundInSearchError,
} from "../../errors/external/lastfm";
import { GowonContext } from "../../lib/context/Context";
import { Payload } from "../../lib/context/Payload";
import { BaseService } from "../BaseService";
import { NowPlayingEmbedParsingService } from "../NowPlayingEmbedParsingService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyArguments } from "../Spotify/SpotifyArguments";
import { RedirectsService } from "../dbservices/RedirectsService";
import { Requestable } from "./LastFMAPIService";
import { LastFMService } from "./LastFMService";
import { RecentTrack } from "./converters/RecentTracks";

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
  fromRecentTrack: RecentTrack;
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
  private get spotifyArguments() {
    return ServiceRegistry.get(SpotifyArguments);
  }

  async getArtist(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions = {}
  ): Promise<string> {
    const artist = this.parsedArguments(ctx).artist as string;

    if (!artist) {
      const spotifyArtist = await this.getSpotifyArtist(ctx);
      if (spotifyArtist) return spotifyArtist;

      return (await this.getNowPlaying(ctx, requestable, options)).artist;
    } else if (options.redirect) {
      return (
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist
      );
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

    if (!artist && !album) {
      const spotifyAlbum = await this.getSpotifyAlbum(ctx);
      if (spotifyAlbum) return spotifyAlbum;
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

    if (!artist && !track) {
      const spotifyTrack = await this.getSpotifyTrack(ctx);
      if (spotifyTrack) return spotifyTrack;
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
    return ctx.runnable.parsedArguments as any;
  }

  private async getNowPlaying(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    options: LastFMArgumentsOptions
  ): Promise<RecentTrack> {
    const originalPayload = ctx.runnable.payload;

    if (options.fromRecentTrack) return options.fromRecentTrack;

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

    if (this.nowPlayingEmbedParsingService.hasParsableGowonEmbed(reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseGowonEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableFmbotEmbed(reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseFmbotEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableChuuEmbed(reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseChuuEmbed(embed);

    if (this.nowPlayingEmbedParsingService.hasParsableWhoKnowsEmbed(reply))
      parsedNowplaying =
        this.nowPlayingEmbedParsingService.parseWhoKnowsEmbed(embed);

    ctx.mutable.parsedNowplaying = parsedNowplaying;

    return parsedNowplaying;
  }

  private async getSpotifyArtist(
    ctx: LastFMArgumentsContext
  ): Promise<string | undefined> {
    const repliedMessage = await ctx.getRepliedMessage();
    if (!repliedMessage) return undefined;

    const spotifyTrack = await this.spotifyArguments.getTrackFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyTrack) return spotifyTrack.artists.primary.name;

    const spotifyAlbum = await this.spotifyArguments.getAlbumFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyAlbum) return spotifyAlbum.artists.primary.name;

    const spotifyArtist = await this.spotifyArguments.getArtistFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyArtist) return spotifyArtist.name;

    return undefined;
  }

  private async getSpotifyAlbum(
    ctx: LastFMArgumentsContext
  ): Promise<{ artist: string; album: string } | undefined> {
    const repliedMessage = await ctx.getRepliedMessage();
    if (!repliedMessage) return undefined;

    const spotifyTrack = await this.spotifyArguments.getTrackFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyTrack) {
      return {
        artist: spotifyTrack.artists.primary.name,
        album: spotifyTrack.album.name,
      };
    }

    const spotifyAlbum = await this.spotifyArguments.getAlbumFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyAlbum) {
      return {
        artist: spotifyAlbum.artists.primary.name,
        album: spotifyAlbum.name,
      };
    }

    return undefined;
  }

  private async getSpotifyTrack(
    ctx: LastFMArgumentsContext
  ): Promise<{ artist: string; track: string } | undefined> {
    const repliedMessage = await ctx.getRepliedMessage();
    if (!repliedMessage) return undefined;

    const spotifyTrack = await this.spotifyArguments.getTrackFromReplied(
      ctx,
      repliedMessage
    );

    if (spotifyTrack) {
      return {
        artist: spotifyTrack.artists.primary.name,
        track: spotifyTrack.name,
      };
    }

    return undefined;
  }
}
