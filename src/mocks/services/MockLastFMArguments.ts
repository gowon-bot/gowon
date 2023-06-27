import { GowonContext } from "../../lib/context/Context";
import { Requestable } from "../../services/LastFM/LastFMAPIService";
import { BaseMockService } from "./BaseMockService";

export class MockLastFMArguments extends BaseMockService {
  async getArtist(
    ctx: GowonContext,
    _requestable: Requestable,
    _redirect?: boolean
  ): Promise<string> {
    return this.parsedArguments(ctx).artist || "Red Velvet";
  }

  async getAlbum(
    ctx: GowonContext,
    _requestable: Requestable,
    _redirect?: boolean
  ): Promise<{ artist: string; album: string }> {
    return {
      artist: await this.getArtist(ctx, _requestable, _redirect),
      album: this.parsedArguments(ctx).album || "Rookie",
    };
  }

  async getTrack(
    ctx: GowonContext,
    _requestable: Requestable,
    _redirect?: boolean
  ): Promise<{ artist: string; track: string }> {
    return {
      artist: await this.getArtist(ctx, _requestable, _redirect),
      track: this.parsedArguments(ctx).track || "Body Talk",
    };
  }

  private parsedArguments(ctx: GowonContext): any {
    return ctx.runnable.parsedArguments as any;
  }
}
