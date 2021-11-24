import { Arguments } from "../../../lib/arguments/arguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { SpotifyAuthenticationService } from "../../../services/Spotify/SpotifyAuthenticationService";
import { SpotifyService } from "../../../services/Spotify/SpotifyService";
import { SpotifyTrackURI } from "../../../services/Spotify/SpotifyService.types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SpotifyBaseCommand<
  T extends Arguments = Arguments
> extends LastFMBaseCommand<T> {
  subcategory = "spotify";
  spotifyService = ServiceRegistry.get(SpotifyService);

  private spotifyLinkRegex = /https:\/\/open\.spotify\.com\/track\/([\w]+)\/?/i;

  protected containsSpotifyLink(string: string) {
    return this.spotifyLinkRegex.test(string);
  }

  protected getSpotifyTrackURI(string: string): SpotifyTrackURI {
    const id = (string.match(this.spotifyLinkRegex) || [])[1];

    return this.spotifyService.generateURI("track", id);
  }
}

export abstract class AuthenticatedSpotifyBaseCommand<
  T extends Arguments = Arguments
> extends SpotifyBaseCommand<T> {
  spotifyAuthenticationService = ServiceRegistry.get(
    SpotifyAuthenticationService
  );

  protected async fetchToken(discordID?: string) {
    const token = await this.spotifyAuthenticationService.getTokenForUser(
      this.ctx,
      discordID || this.author.id
    );

    this.ctx.spotifyToken = token;
  }
}
