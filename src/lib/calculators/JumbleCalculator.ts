import { LastFMService } from "../../services/LastFM/LastFMService";
import { TopArtist } from "../../services/LastFM/converters/TopTypes";

export class JumbleCalculator {
  constructor(private username: string, private lastFMService: LastFMService) {}

  async getArtist(
    poolAmount: number,
    options: { nonAscii?: boolean } = {}
  ): Promise<TopArtist | undefined> {
    let topArtists = await this.lastFMService.topArtists({
      username: this.username,
      limit: poolAmount,
    });
    let filter = topArtists.artists.filter((a) =>
      this.artistFilter(a.name, options.nonAscii || false)
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
