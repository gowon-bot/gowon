import { LastFMService } from "../../services/LastFMService";
import { TopArtist } from "../../services/LastFMService.types";

export class JumbleCalculator {
  username: string;
  lastFMService: LastFMService;

  constructor(username: string, lastFMService: LastFMService) {
    this.username = username;
    this.lastFMService = lastFMService;
  }

  async getArtist(poolAmount: number): Promise<TopArtist | undefined> {
    let topArtists = await this.lastFMService.topArtists(this.username, poolAmount);
    let filter = topArtists.artist.filter((a) => this.artistFilter(a.name));

    return filter[Math.floor(Math.random() * filter.length)];
  }

  private artistFilter(artistName: string): boolean {
    return (
      artistName.length > 4 && !!artistName.match(/^[\s0-9A-Z\.,()&!?\-"':]+$/i)
    );
  }
}
