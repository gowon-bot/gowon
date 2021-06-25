import { fromUnixTime } from "date-fns";
import { Logger } from "../../lib/Logger";
import { BaseService } from "../BaseService";
import { RedisInteractionService } from "./RedisInteractionService";

export class RedisService extends BaseService {
  private redis = RedisInteractionService.getInstance();

  defaultExpiry: number;
  prefix: string;

  constructor(
    logger: Logger | undefined,
    options: {
      defaultExpiry?: number;
      prefix?: string;
    } = {}
  ) {
    super(logger);
    this.defaultExpiry = options.defaultExpiry || 600;
    this.prefix = options.prefix || "";
  }

  // Get
  async get(key: string) {
    return this.redis.get(this.prefixedKey(key));
  }

  async sessionGet(discordID: string, guildID: string, key: string) {
    return this.redis.get(this.sessionKey(discordID, guildID, key));
  }

  // Set
  async set(key: string, value: string, expiresAfter?: number) {
    this.redis.set(
      this.prefixedKey(key),
      value,
      expiresAfter || this.defaultExpiry
    );
  }

  async sessionSet(
    discordID: string,
    guildID: string,
    key: string,
    value: any,
    expiresAfter?: number
  ) {
    return this.redis.set(
      this.sessionKey(discordID, guildID, key),
      value,
      expiresAfter || this.defaultExpiry
    );
  }

  // Delete
  delete(key: string) {
    return this.redis.delete(this.prefixedKey(key));
  }

  sessionDelete(discordID: string, guildID: string, key: string) {
    return this.redis.delete(this.sessionKey(discordID, guildID, key));
  }

  // Helpers
  public encodeDate(date: Date): string {
    return `${date.getTime()}`;
  }

  public parseDate(date: string): Date {
    return fromUnixTime(parseInt(date) / 1000);
  }

  // Private methods
  private prefixedKey(key: string): string {
    return this.prefix ? `${this.prefix}-${key}` : key;
  }

  private sessionKey(discordID: string, guildID: string, key: string): string {
    return this.prefixedKey(`${discordID}:${guildID}-${key}`);
  }
}
