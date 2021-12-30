import { stringify } from "querystring";
import { BaseServiceContext } from "../BaseService";
import { UsersService } from "../dbservices/UsersService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyService } from "./SpotifyService";
import { SpotifyAuthUser, SpotifyCode } from "./SpotifyService.types";
import config from "../../../config.json";
import { Chance } from "chance";
import { RedisService } from "../redis/RedisService";
import { BaseSpotifyService } from "./BaseSpotifyService";
import { NotAuthenticatedWithSpotifyError } from "../../errors";
import { SpotifyToken } from "./converters/Auth";

export class SpotifyAuthenticationService extends BaseSpotifyService {
  private readonly scope = [
    "playlist-modify-public",
    "user-library-modify",
    "user-modify-playback-state",
    "playlist-read-private",
    "playlist-modify-public",
    "playlist-modify-private",
  ].join(" ");

  customContext = {
    prefix: "spotify-token",
  };

  get spotifyService() {
    return ServiceRegistry.get(SpotifyService);
  }

  get usersService() {
    return ServiceRegistry.get(UsersService);
  }

  get redisService() {
    return ServiceRegistry.get(RedisService);
  }

  generateState() {
    return Chance().string({ length: 16, symbols: false });
  }

  generateAuthURL(state: string): string {
    const queryParams = stringify({
      response_type: "code",
      client_id: config.spotifyClientID,
      scope: this.scope,
      redirect_uri: this.generateRedirectURI(),
      state,
    });

    return `${this.authURL}?${queryParams}`;
  }

  async handleSpotifyCodeResponse(
    ctx: BaseServiceContext,
    user: SpotifyAuthUser,
    code: SpotifyCode
  ) {
    await this.usersService.setSpotifyCode(ctx, user.discordID, code);
    await this.redisService.set(this.ctx(ctx), user.discordID, "");
  }

  async getTokenForUser(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<SpotifyToken> {
    const tokenString = await this.redisService.get(this.ctx(ctx), discordID);
    const token = tokenString ? SpotifyToken.fromJSON(tokenString) : undefined;

    if (token && !token.isExpired()) {
      return token;
    }

    const code = await this.usersService.getSpotifyCode(ctx, discordID);

    if (!code && !token) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }

    const newToken = await this.spotifyService.fetchToken(ctx, {
      refreshToken: token?.refreshToken,
      code: code?.code,
    });

    this.saveTokenToRedis(ctx, discordID, newToken);

    return newToken;
  }

  private async saveTokenToRedis(
    ctx: BaseServiceContext,
    discordID: string,
    token: SpotifyToken
  ) {
    this.redisService.set(
      this.ctx(ctx),
      discordID,
      token.asJSON(),
      token.expiresInSeconds
    );
  }
}
