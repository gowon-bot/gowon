import { add, fromUnixTime, isAfter } from "date-fns";
import { IOAuth2RequestTokenResult } from "twitter-api-v2";
import { BaseTwitterConverter } from "./BaseConverter";

export class TwitterAuthURL extends BaseTwitterConverter {
  url: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;

  constructor(url: IOAuth2RequestTokenResult) {
    super();

    this.url = url.url;
    this.state = url.state;
    this.codeVerifier = url.codeVerifier;
    this.codeChallenge = url.codeChallenge;
  }
}

export class TwitterToken extends BaseTwitterConverter {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public expiresIn: number,
    private fetchedAt: Date = new Date()
  ) {
    super();
  }

  public isExpired(): boolean {
    const dateExpires = add(this.fetchedAt, {
      seconds: this.expiresIn - 5,
    });

    return isAfter(new Date(), dateExpires);
  }

  public asJSON() {
    return JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresIn: this.expiresIn,
      fetchedAt: this.fetchedAt.getTime(),
    });
  }

  static fromJSON(jsonString: string): TwitterToken {
    const json = JSON.parse(jsonString);

    return new TwitterToken(
      json.accessToken,
      json.refreshToken,
      json.expiresIn,
      fromUnixTime(json.fetchedAt)
    );
  }
}
