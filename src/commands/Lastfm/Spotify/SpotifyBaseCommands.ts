import {
  GetMentionsOptions,
  GetMentionsReturn,
} from "../../../helpers/getMentions";
import { Arguments } from "../../../lib/arguments/arguments";
import { ArgumentName } from "../../../lib/command/ArgumentType";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyArguments } from "../../../services/Spotify/SpotifyArguments";
import { SpotifyAuthenticationService } from "../../../services/Spotify/SpotifyAuthenticationService";
import {
  SpotifySearchParams,
  SpotifyService,
} from "../../../services/Spotify/SpotifyService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends Arguments = Arguments
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = ServiceRegistry.get(SpotifyService);
  spotifyArguments = ServiceRegistry.get(SpotifyArguments);

  protected getKeywords(params: SpotifySearchParams<any>): string {
    return this.spotifyService.getKeywords(params);
  }
}

export abstract class AuthenticatedSpotifyBaseCommand<
  T extends Arguments = Arguments
> extends SpotifyBaseCommand<T> {
  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );

  private async fetchToken(discordID?: string) {
    const token = await this.spotifyAuthenticationService.getTokenForUser(
      this.ctx,
      discordID || this.author.id
    );

    this.ctx.spotifyToken = token;
  }

  async getMentions(
    options: GetMentionsOptions<ArgumentName<T>> & {
      fetchSpotifyToken?: boolean;
    }
  ): Promise<GetMentionsReturn> {
    if (options.fetchSpotifyToken) await this.fetchToken();

    return await super.getMentions(options);
  }
}
