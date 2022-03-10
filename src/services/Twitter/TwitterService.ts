import { BaseService } from "../BaseService";
import { TwitterApi } from "twitter-api-v2";
import { TwitterAuthURL, TwitterToken } from "./converters/Auth";
import { TwitterWebhookService } from "../../api/webhooks/TwitterWebhookService";
import config from "../../../config.json";
import { LogicError } from "../../errors/errors";
import { ServiceRegistry } from "../ServicesRegistry";
import { RedisService } from "../redis/RedisService";
import { GowonContext } from "../../lib/context/Context";
import { TweetStream } from "./converters/TweetStream";

export interface TweetOptions {
  replyTo?: string;
}

export class TwitterService extends BaseService {
  private get redisService() {
    return ServiceRegistry.get(RedisService);
  }

  customContext = {
    constants: {
      redisOptions: {
        prefix: "twitter",
      },
    },
  };

  private client = new TwitterApi({
    clientId: config.twitterClientID,
    clientSecret: config.twitterClientSecret,
  });
  private streamClient = new TwitterApi(config.twitterBearerToken);

  private token?: TwitterToken;
  public mentions!: TweetStream;

  private redirectURI = "http://localhost:3000/webhooks/twitter";
  private scope = ["tweet.read", "tweet.write", "users.read", "offline.access"];

  private twitterWebhookService = TwitterWebhookService.getInstance();

  async buildStream() {
    const stream = this.streamClient.v2.searchStream({
      expansions: ["author_id"],
      "tweet.fields": ["created_at"],
      autoConnect: false,
    });

    const rules = await this.streamClient.v2.streamRules();

    if (rules.data) {
      await this.streamClient.v2.updateStreamRules({
        delete: { ids: rules.data.map((d) => d.id) },
      });
    }

    await this.streamClient.v2.updateStreamRules({
      add: [
        { value: `-is:retweet @${config.twitterUsername}`, tag: "mentioned" },
      ],
    });

    this.mentions = new TweetStream(stream);

    await this.mentions.init();
  }

  async tweet(
    ctx: GowonContext,
    text: string,
    options?: Partial<TweetOptions>
  ) {
    this.log(ctx, `Tweeting "${text}"`);

    await this.ensureLoggedIn(ctx);

    return this.client.v2.tweet(
      text,
      options?.replyTo
        ? { reply: { in_reply_to_tweet_id: options.replyTo } }
        : {}
    );
  }

  setTwitterClient(client: TwitterApi) {
    this.client = client;
  }

  generateURL(): TwitterAuthURL {
    const url = this.client.generateOAuth2AuthLink(this.redirectURI, {
      scope: this.scope,
    });

    return new TwitterAuthURL(url);
  }

  async botLogin(
    ctx: GowonContext,
    url: TwitterAuthURL
  ): Promise<TwitterToken> {
    const response = await this.twitterWebhookService.waitForResponse(url);

    const loggedIn = await this.client.loginWithOAuth2({
      code: response.code,
      codeVerifier: url.codeVerifier,
      redirectUri: this.redirectURI,
    });

    this.setTwitterClient(loggedIn.client);

    const token = new TwitterToken(
      loggedIn.accessToken,
      loggedIn.refreshToken!,
      loggedIn.expiresIn
    );

    await this.saveToken(ctx, token);

    return token;
  }

  private async ensureLoggedIn(ctx: GowonContext): Promise<void> {
    if (this.token) {
      if (this.token.isExpired()) {
        this.refreshToken(ctx);
      }
    } else {
      const fromRedis = await this.fetchSavedToken(ctx);

      if (fromRedis) {
        this.token = fromRedis;

        const newClient = new TwitterApi(fromRedis.accessToken);

        this.setTwitterClient(newClient);
        return;
      }

      throw new LogicError("Bot not authenticated with Twitter!");
    }
  }

  private async refreshToken(ctx: GowonContext) {
    this.log(ctx, "Refreshing Twitter token");

    const refreshed = await this.client.refreshOAuth2Token(
      this.token!.refreshToken
    );

    this.setTwitterClient(refreshed.client);

    const newToken = new TwitterToken(
      refreshed.accessToken,
      refreshed.refreshToken!,
      refreshed.expiresIn
    );

    await this.saveToken(ctx, newToken);
  }

  private async saveToken(ctx: GowonContext, token: TwitterToken) {
    await this.redisService.set(
      this.ctx(ctx),
      "token",
      token.asJSON(),
      token.expiresIn
    );
  }

  private async fetchSavedToken(
    ctx: GowonContext
  ): Promise<TwitterToken | undefined> {
    const jsonString = await this.redisService.get(this.ctx(ctx), "token");

    return jsonString ? TwitterToken.fromJSON(jsonString) : undefined;
  }
}
