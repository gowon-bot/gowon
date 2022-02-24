import { GowonContext } from "../../lib/context/Context";
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
    redirect?: boolean
  ): Promise<string> {
    let artist = this.parsedArguments(ctx).artist as string;

    if (!artist) {
      artist = (await this.getNowPlaying(ctx, requestable)).artist;
    } else if (redirect) {
      artist =
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist;
    }

    return artist;
  }

  async getAlbum(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    redirect?: boolean
  ): Promise<{ artist: string; album: string }> {
    let artist = this.parsedArguments(ctx).artist as string,
      album = this.parsedArguments(ctx).album as string;

    if (!artist || !album) {
      const nowPlaying = await this.getNowPlaying(ctx, requestable);

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    } else if (artist && redirect) {
      artist =
        (await this.redirectsService.getRedirect(ctx, artist))?.to || artist;
    }

    return { artist, album };
  }

  async getTrack(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    redirect?: boolean
  ): Promise<{ artist: string; track: string }> {
    let artist = this.parsedArguments(ctx).artist as string,
      track = this.parsedArguments(ctx).track as string;

    if (!artist || !track) {
      const nowPlaying = await this.getNowPlaying(ctx, requestable);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    } else if (artist && redirect) {
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
    requestable: Requestable
  ): Promise<RecentTrack> {
    const originalMessage = ctx.command.message;

    if (originalMessage.reference) {
      const reply = await originalMessage.fetchReference();
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

      if (
        this.nowPlayingEmbedParsingService.hasParsableWhoKnowsEmbed(ctx, reply)
      )
        parsedNowplaying =
          this.nowPlayingEmbedParsingService.parseWhoKnowsEmbed(embed);

      if (parsedNowplaying) {
        ctx.mutable.parsedNowplaying = parsedNowplaying;
        return parsedNowplaying;
      }
    }

    const nowplaying = await this.lastFMService.nowPlaying(ctx, requestable);

    ctx.mutable.nowplaying = nowplaying;

    return nowplaying;
  }
}
