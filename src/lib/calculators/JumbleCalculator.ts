import { LastFMService } from "../../services/LastFM/LastFMService";
import { TopArtist } from "../../services/LastFM/converters/TopTypes";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";

export class JumbleCalculator {
  private lastFMService = ServiceRegistry.get(LastFMService);

  constructor(private ctx: GowonContext, private username: string) {}

  async getArtist(
    poolAmount: number,
    options: { includeNonAlphanumeric?: boolean } = {}
  ): Promise<TopArtist | undefined> {
    let topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: this.username,
      limit: poolAmount,
    });
    let filter = topArtists.artists.filter((a) =>
      this.artistFilter(a.name, options.includeNonAlphanumeric || false)
    );

    return filter[Math.floor(Math.random() * filter.length)];
  }

  private artistFilter(artistName: string, allowNonAscii: boolean): boolean {
    return (
      artistName.length > 4 &&
      (allowNonAscii || !!artistName.match(/^[\s0-9A-Z\.,()&!?\-"':]+$/i))
    );
  }
}
