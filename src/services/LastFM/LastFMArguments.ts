import { BaseCommand } from "../../lib/command/BaseCommand";
import { Logger } from "../../lib/Logger";
import { BaseService } from "../BaseService";
import { RedirectsService } from "../dbservices/RedirectsService";
import { Requestable } from "./LastFMAPIService";
import { LastFMService } from "./LastFMService";

export class LastFMArguments extends BaseService {
  private redirectsService = new RedirectsService(this.logger);

  constructor(
    private command: BaseCommand<any>,
    private lastFMService: LastFMService,
    logger?: Logger
  ) {
    super(logger);
  }

  async getArtist(
    requestable: Requestable,
    redirect?: boolean
  ): Promise<string> {
    let artist = this.parsedArguments.artist as string;

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(requestable)).artist;
    } else if (redirect) {
      artist = (await this.redirectsService.getRedirect(artist))?.to || artist;
    }

    return artist;
  }

  async getAlbum(
    requestable: Requestable,
    redirect?: boolean
  ): Promise<{ artist: string; album: string }> {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    if (!artist || !album) {
      const nowPlaying = await this.lastFMService.nowPlaying(requestable);

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    } else if (artist && redirect) {
      artist = (await this.redirectsService.getRedirect(artist))?.to || artist;
    }

    return { artist, album };
  }

  async getTrack(
    requestable: Requestable,
    redirect?: boolean
  ): Promise<{ artist: string; track: string }> {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    if (!artist || !track) {
      const nowPlaying = await this.lastFMService.nowPlaying(requestable);

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.album;
    } else if (artist && redirect) {
      artist = (await this.redirectsService.getRedirect(artist))?.to || artist;
    }

    return { artist, track };
  }

  private get parsedArguments(): any {
    return this.command.parsedArguments as any;
  }
}
