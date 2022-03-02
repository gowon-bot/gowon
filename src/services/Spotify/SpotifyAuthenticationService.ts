import { stringify } from "querystring";
import { UsersService } from "../dbservices/UsersService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyService, SpotifyServiceContext } from "./SpotifyService";
import { SpotifyAuthUser, SpotifyCode } from "./SpotifyService.types";
import config from "../../../config.json";
import { Chance } from "chance";
import {
  RedisService,
  RedisServiceContextOptions,
} from "../redis/RedisService";
import { BaseSpotifyService } from "./BaseSpotifyService";
import { NotAuthenticatedWithSpotifyError } from "../../errors";
import { SpotifyToken } from "./converters/Auth";
import { GowonContext } from "../../lib/context/Context";

type SpotifyAuthenticationServiceContext = GowonContext<{
  constants?: { redisOptions?: RedisServiceContextOptions };
}>;

export class SpotifyAuthenticationService extends BaseSpotifyService<SpotifyAuthenticationServiceContext> {
  private readonly scope = [
    "playlist-modify-public",
    "user-library-modify",
    "user-modify-playback-state",
    "playlist-read-private",
    "playlist-modify-public",
    "playlist-modify-private",
  ].join(" ");

  customContext = {
    constants: { redisOptions: { prefix: "spotify-token" } },
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
    ctx: SpotifyServiceContext,
    user: SpotifyAuthUser,
    code: SpotifyCode
  ) {
    const token = await this.spotifyService.fetchToken(ctx, {
      code: code.code,
    });

    await this.usersService.setSpotifyRefreshToken(
      ctx,
      user.discordID,
      token.refreshToken!
    );

    await this.redisService.set(
      this.ctx(ctx),
      user.discordID,
      token.asJSON(),
      token.expiresInSeconds
    );
  }

  async getTokenForUser(
    ctx: SpotifyServiceContext,
    discordID: string
  ): Promise<SpotifyToken> {
    const tokenString = await this.redisService.get(this.ctx(ctx), discordID);
    const token = tokenString ? SpotifyToken.fromJSON(tokenString) : undefined;

    if (token && !token.isExpired()) {
      return token;
    }

    const refreshToken = await this.usersService.getSpotifyRefreshToken(
      ctx,
      discordID
    );

    if (!refreshToken && !token) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }

    const newToken = await this.spotifyService.fetchToken(ctx, {
      refreshToken: token?.refreshToken || refreshToken,
    });

    if (newToken.refreshToken) {
      this.usersService.setSpotifyRefreshToken(
        ctx,
        discordID,
        newToken.refreshToken
      );
    }
    this.saveTokenToRedis(ctx, discordID, newToken);

    return newToken;
  }

  private async saveTokenToRedis(
    ctx: SpotifyServiceContext,
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
