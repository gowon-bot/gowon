import { LastFMService } from "../../services/LastFMService";
import { TopArtist } from "../../services/LastFMService.types";

export class JumbleCalculator {
  username: string;
  lastFMService: LastFMService;

  constructor(username: string, lastFMService: LastFMService) {
    this.username = username;
    this.lastFMService = lastFMService;
  }

  async getArtist(
    poolAmount: number,
    options: { nonAscii?: boolean } = {}
  ): Promise<TopArtist | undefined> {
    let topArtists = await this.lastFMService.topArtists({
      username: this.username,
      limit: poolAmount,
    });
    let filter = topArtists.artist.filter((a) =>
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
