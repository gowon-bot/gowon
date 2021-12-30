import { BaseService } from "../BaseService";
import config from "../../../config.json";

export class BaseSpotifyService extends BaseService {
  readonly tokenURL = "https://accounts.spotify.com/api/token";
  readonly authURL = "https://accounts.spotify.com/authorize";
  readonly apiURL = "https://api.spotify.com/v1/";

  protected generateRedirectURI(): string {
    return config.gowonAPIURL + "/api/spotifyWebhook";
  }
}
