import { ChildCommand } from "../../lib/command/ChildCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import {
  GetMentionsOptions,
  Mentions,
} from "../../services/arguments/mentions/MentionsService.types";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SpotifyToken } from "../../services/Spotify/converters/Auth";
import { SpotifyArguments } from "../../services/Spotify/SpotifyArguments";
import { SpotifyAuthenticationService } from "../../services/Spotify/SpotifyAuthenticationService";
import {
  SpotifySearchParams,
  SpotifyService,
} from "../../services/Spotify/SpotifyService";
import {
  LastFMBaseCommand,
  LastFMBaseParentCommand,
} from "../Lastfm/LastFMBaseCommand";

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
    options: Partial<GetMentionsOptions> & {
      fetchSpotifyToken?: boolean;
    }
  ): Promise<Mentions> {
    if (options.fetchSpotifyToken) await this.fetchToken();

    return await super.getMentions(options);
  }
}

export abstract class SpotifyBaseParentCommand extends LastFMBaseParentCommand {
  category = "spotify";
}

export abstract class SpotifyBaseChildCommand<T extends ArgumentsMap = {}>
  extends AuthenticatedSpotifyBaseCommand<T>
  implements ChildCommand<T>
{
  isChild = true;
  abstract parentName: string;
  shouldBeIndexed = false;
}
