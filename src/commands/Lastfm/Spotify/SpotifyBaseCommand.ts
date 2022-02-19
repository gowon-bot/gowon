import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyService } from "../../../services/Spotify/SpotifyService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = ServiceRegistry.get(SpotifyService);
}
