import { fromUnixTime } from "date-fns";
import { BaseService, BaseServiceContext } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { RedisInteractionService } from "./RedisInteractionService";

type RedisServiceContext = BaseServiceContext & {
  options: {
    defaultExpirySeconds?: number;
    prefix?: string;
  };
};

export class RedisService extends BaseService {
  private get redis() {
    return ServiceRegistry.get(RedisInteractionService);
  }

  // Get
  async get(ctx: RedisServiceContext, key: string) {
    return this.redis.get(ctx, this.prefixedKey(ctx, key));
  }

  async sessionGet(ctx: RedisServiceContext, key: string) {
    return this.redis.get(ctx, this.sessionKey(ctx, key));
  }

  // Set
  async set(
    ctx: RedisServiceContext,
    key: string,
    value: string,
    expiresAfter?: number
  ) {
    this.redis.set(
      ctx,
      this.prefixedKey(ctx, key),
      value,
      expiresAfter || this.getDefaultExpiry(ctx)
    );
  }

  async sessionSet(
    ctx: RedisServiceContext,
    key: string,
    value: any,
    expiresAfter?: number
  ) {
    return this.redis.set(
      ctx,
      this.sessionKey(ctx, key),
      value,
      expiresAfter || this.getDefaultExpiry(ctx)
    );
  }

  // Delete
  delete(ctx: RedisServiceContext, key: string) {
    return this.redis.delete(ctx, this.prefixedKey(ctx, key));
  }

  sessionDelete(ctx: RedisServiceContext, key: string) {
    return this.redis.delete(ctx, this.sessionKey(ctx, key));
  }

  // Helpers
  public encodeDate(date: Date): string {
    return `${date.getTime()}`;
  }

  public parseDate(date: string): Date {
    return fromUnixTime(parseInt(date) / 1000);
  }

  // Private methods
  private prefixedKey(ctx: RedisServiceContext, key: string): string {
    return this.getPrefix(ctx) ? `${this.getPrefix(ctx)}-${key}` : key;
  }

  private sessionKey(ctx: RedisServiceContext, key: string): string {
    const discordID = this.author(ctx).id;
    const guildID = this.guild(ctx).id;

    return this.prefixedKey(ctx, `${discordID}:${guildID}-${key}`);
  }

  private getDefaultExpiry(ctx: RedisServiceContext): number {
    return ctx.options?.defaultExpirySeconds || 600;
  }

  private getPrefix(ctx: RedisServiceContext): string {
    return ctx.options?.prefix || "";
  }
}
