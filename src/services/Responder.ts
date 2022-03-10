import { Message, MessageEmbed } from "discord.js";
import { TweetV2PostTweetResult } from "twitter-api-v2";
import { GowonContext } from "../lib/context/Context";
import { BaseService } from "./BaseService";
import { DiscordService, SendOptions } from "./Discord/DiscordService";
import { ServiceRegistry } from "./ServicesRegistry";
import { TweetOptions, TwitterService } from "./Twitter/TwitterService";

export class Responder extends BaseService {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  private get twitterService() {
    return ServiceRegistry.get(TwitterService);
  }

  async discord(
    ctx: GowonContext,
    content: string | MessageEmbed,
    options?: Partial<SendOptions>
  ): Promise<Message | undefined> {
    if (ctx.payload.isInteraction() || ctx.payload.isMessage()) {
      return await this.discordService.send(ctx, content, options);
    } else return undefined;
  }

  async twitter(ctx: GowonContext, content: string, options?: TweetOptions) {
    if (ctx.payload.isTweet()) {
      return await this.twitterService.tweet(
        ctx,
        content,
        Object.assign({ replyTo: ctx.payload.source.id }, options || {})
      );
    }

    return undefined;
  }

  async all(
    ctx: GowonContext,
    content: string,
    options?: Partial<{ discord: SendOptions; twitter: TweetOptions }>
  ): Promise<Message | TweetV2PostTweetResult | undefined> {
    if (ctx.payload.isInteraction() || ctx.payload.isMessage()) {
      return await this.discord(ctx, content, options?.discord);
    } else if (ctx.payload.isTweet()) {
      return await this.twitter(ctx, content, options?.twitter);
    }

    return undefined;
  }
}
