import { add, fromUnixTime, isAfter } from "date-fns";
import { RawSpotifyToken } from "../SpotifyService.types";
import { BaseSpotifyConverter } from "./BaseConverter";

export class SpotifyToken extends BaseSpotifyConverter {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;

  // Contained with Authorization code flow
  // (ie. when code is present)
  refreshToken?: string;

  // Not contained in spotify response
  code?: string;
  fetchedAt: Date;

  constructor(
    token: RawSpotifyToken & {
      fetched_at?: number;
      code?: string;
      refresh_token?: string;
    }
  ) {
    super();

    this.accessToken = token.access_token;
    this.tokenType = token.token_type;
    this.expiresInSeconds = token.expires_in;
    this.fetchedAt = token.fetched_at
      ? fromUnixTime(token.fetched_at / 1000)
      : new Date();
    this.code = token.code;
    this.refreshToken = token.refresh_token;
  }

  static fromJSON(json: string): SpotifyToken {
    return new SpotifyToken(JSON.parse(json));
  }

  public asJSON(): string {
    return JSON.stringify({
      access_token: this.accessToken,
      token_type: this.tokenType,
      expires_in: this.expiresInSeconds,
      fetched_at: this.fetchedAt.getTime(),
      code: this.code,
      refresh_token: this.refreshToken,
    });
  }

  public isExpired(): boolean {
    const dateExpires = add(this.fetchedAt, {
      seconds: this.expiresInSeconds - 5,
    });

    return isAfter(new Date(), dateExpires);
  }
}
