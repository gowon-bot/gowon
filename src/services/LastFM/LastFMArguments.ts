import { BaseCommand } from "../../lib/command/BaseCommand";
import { BaseService, BaseServiceContext } from "../BaseService";
import { RedirectsService } from "../dbservices/RedirectsService";
import { ServiceRegistry } from "../ServicesRegistry";
import { Requestable } from "./LastFMAPIService";
import { LastFMService } from "./LastFMService";

type LastFMArgumentsContext = BaseServiceContext & {
  command: BaseCommand;
};

export class LastFMArguments extends BaseService {
  private get redirectsService() {
    return ServiceRegistry.get(RedirectsService);
  }
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }

  async getArtist(
    ctx: LastFMArgumentsContext,
    requestable: Requestable,
    redirect?: boolean
  ): Promise<string> {
    let artist = this.parsedArguments(ctx).artist as string;

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(ctx, requestable)).artist;
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
      const nowPlaying = await this.lastFMService.nowPlaying(ctx, requestable);

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
      const nowPlaying = await this.lastFMService.nowPlaying(ctx, requestable);

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
}
