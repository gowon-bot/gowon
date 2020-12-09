import { SpotifyService } from "../../../services/Spotify/SpotifyService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand extends LastFMBaseCommand {
  subcategory = "spotify";
  spotifyService = new SpotifyService(this.logger);
}
