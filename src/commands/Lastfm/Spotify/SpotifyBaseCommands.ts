import {
  GetMentionsOptions,
  GetMentionsReturn,
} from "../../../helpers/getMentions";
import { BetaAccess } from "../../../lib/command/access/access";
import {
  ArgumentName,
  ArgumentsMap,
} from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyToken } from "../../../services/Spotify/converters/Auth";
import { SpotifyArguments } from "../../../services/Spotify/SpotifyArguments";
import { SpotifyAuthenticationService } from "../../../services/Spotify/SpotifyAuthenticationService";
import {
  SpotifySearchParams,
  SpotifyService,
} from "../../../services/Spotify/SpotifyService";
import {
  LastFMBaseCommand,
  LastFMBaseParentCommand,
} from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = ServiceRegistry.get(SpotifyService);
  spotifyArguments = ServiceRegistry.get(SpotifyArguments);

  protected getKeywords(params: SpotifySearchParams<any>): string {
    return this.spotifyService.getKeywords(params);
  }
}

export abstract class AuthenticatedSpotifyBaseCommand<
  T extends ArgumentsMap = {}
> extends SpotifyBaseCommand<T> {
  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );

  access = new BetaAccess();

  customContext = { mutable: {} };

  private async fetchToken(discordID?: string) {
    const token = await this.spotifyAuthenticationService.getTokenForUser(
      this.ctx,
      discordID || this.author.id
    );
    this.mutableContext<{
      spotifyToken?: SpotifyToken;
    }>().mutable.spotifyToken = token;
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

export abstract class SpotifyBaseParentCommand extends LastFMBaseParentCommand {
  category = "spotify";
}

export abstract class SpotifyBaseChildCommand<
  T extends ArgumentsMap = {}
> extends AuthenticatedSpotifyBaseCommand<T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
