import { Arguments } from "../../../lib/arguments/arguments";
import { SpotifyService } from "../../../services/Spotify/SpotifyService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends Arguments = Arguments
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = new SpotifyService(this.logger);
}
