import { BaseService, BaseServiceContext } from "../BaseService";
import { RedirectsService } from "../dbservices/RedirectsService";
import { NowPlayingEmbedParsingService } from "../NowPlayingEmbedParsingService";
import { ServiceRegistry } from "../ServicesRegistry";
import { RecentTrack } from "./converters/RecentTracks";
import { Requestable } from "./LastFMAPIService";
import { LastFMService } from "./LastFMService";

type LastFMArgumentsMutableContext = {
  nowplaying: RecentTrack;
  parsedNowplaying: RecentTrack;
};

export class LastFMArguments extends BaseService<BaseServiceContext> {
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
    ctx: BaseServiceContext & LastFMArgumentsMutableContext,
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
    ctx: BaseServiceContext & LastFMArgumentsMutableContext,
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
    ctx: BaseServiceContext & LastFMArgumentsMutableContext,
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

  private parsedArguments(ctx: BaseServiceContext): any {
    return ctx.command.parsedArguments as any;
  }

  private async getNowPlaying(
    ctx: BaseServiceContext & LastFMArgumentsMutableContext,
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

      if (parsedNowplaying) {
        ctx.parsedNowplaying = parsedNowplaying;
        return parsedNowplaying;
      }
    }

    const nowplaying = await this.lastFMService.nowPlaying(ctx, requestable);

    ctx.nowplaying = nowplaying;

    return nowplaying;
  }
}
