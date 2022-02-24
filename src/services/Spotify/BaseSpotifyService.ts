import { BaseService } from "../BaseService";
import config from "../../../config.json";
import { GowonContext } from "../../lib/context/Context";

export class BaseSpotifyService<
  T extends GowonContext = GowonContext<{}>
> extends BaseService<T> {
  readonly tokenURL = "https://accounts.spotify.com/api/token";
  readonly authURL = "https://accounts.spotify.com/authorize";
  readonly apiURL = "https://api.spotify.com/v1/";

  protected generateRedirectURI(): string {
    console.log(config.spotifyRedirectHost);

    return (
      (config.spotifyRedirectHost || config.gowonAPIURL) + "/api/spotifyWebhook"
    );
  }
}
