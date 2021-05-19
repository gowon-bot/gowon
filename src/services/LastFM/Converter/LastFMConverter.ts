import { BaseService } from "../../BaseService";
import { LastFMService } from "../LastFMService";
import { ArtistInfoParams, TrackInfoParams } from "../LastFMService.types";
import { ConvertedArtistInfo, ConvertedTrackInfo } from "./InfoTypes";

export class LastFMConverter extends BaseService {
  private lastFMService = new LastFMService(this.logger);

  async artistInfo(params: ArtistInfoParams): Promise<ConvertedArtistInfo> {
    return new ConvertedArtistInfo(await this.lastFMService.artistInfo(params));
  }

  async trackInfo(params: TrackInfoParams): Promise<ConvertedTrackInfo> {
    return new ConvertedTrackInfo(await this.lastFMService.trackInfo(params));
  }
}
