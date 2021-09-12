import { Arguments } from "../../../lib/arguments/arguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyService } from "../../../services/Spotify/SpotifyService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends Arguments = Arguments
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = ServiceRegistry.get(SpotifyService);
}
