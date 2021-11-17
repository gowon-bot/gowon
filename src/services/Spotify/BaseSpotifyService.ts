import { BaseService } from "../BaseService";
import config from "../../../config.json";
import { add, isBefore } from "date-fns";
import { SpotifyToken } from "./SpotifyService.types";

export class BaseSpotifyService extends BaseService {
  readonly tokenURL = "https://accounts.spotify.com/api/token";
  readonly authURL = "https://accounts.spotify.com/authorize";
  readonly apiURL = "https://api.spotify.com/v1/";

  protected generateRedirectURI(): string {
    return config.gowonAPIURL + "/api/spotifyWebhook";
  }

  protected tokenIsValid(token: SpotifyToken, fetchedAt: Date): boolean {
    const dateExpires = add(fetchedAt, {
      seconds: token.expires_in - 5,
    });

    return isBefore(new Date(), dateExpires);
  }
}
