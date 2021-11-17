import { stringify } from "querystring";
import { BaseServiceContext } from "../BaseService";
import { UsersService } from "../dbservices/UsersService";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyService } from "./SpotifyService";
import {
  PersonalSpotifyToken,
  SpotifyAuthUser,
  SpotifyCode,
  SpotifyToken,
} from "./SpotifyService.types";
import config from "../../../config.json";
import { Chance } from "chance";
import { RedisService } from "../redis/RedisService";
import { BaseSpotifyService } from "./BaseSpotifyService";
import { fromUnixTime } from "date-fns";
import { NotAuthenticatedWithSpotifyError } from "../../errors";

export class SpotifyAuthenticationService extends BaseSpotifyService {
  private readonly scope = "playlist-modify-public";

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
    this.usersService.setSpotifyCode(ctx, user.discordID, code);
  }

  async getTokenForUser(
    ctx: BaseServiceContext,
    discordID: string
  ): Promise<PersonalSpotifyToken> {
    const tokenString = await this.redisService.get(this.ctx(ctx), discordID);

    if (tokenString) {
      const token = JSON.parse(tokenString) as PersonalSpotifyToken;

      console.log(token);

      if (this.tokenIsValid(token, fromUnixTime(token.fetchedAt))) {
        return token;
      }
    }

    const code = await this.usersService.getSpotifyCode(ctx, discordID);

    if (!code) {
      throw new NotAuthenticatedWithSpotifyError(ctx.command.prefix);
    }

    const token = (await this.spotifyService.fetchToken(
      ctx,
      code
    )) as any as PersonalSpotifyToken;

    this.saveTokenToRedis(ctx, discordID, token);

    return token;
  }

  private async saveTokenToRedis(
    ctx: BaseServiceContext,
    discordID: string,
    token: SpotifyToken
  ) {
    this.redisService.set(
      this.ctx(ctx),
      discordID,
      JSON.stringify(token),
      token.expires_in
    );
  }
}
