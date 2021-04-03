import { BaseService } from "./BaseService";
import redis, { RedisError } from "redis";
import { promisify } from "util";
import { Message } from "discord.js";
import { Logger } from "../lib/Logger";
import { fromUnixTime } from "date-fns";

export class RedisService extends BaseService {
  client = redis.createClient();
  defaultExpiry: number;
  sessionPrefix: string;

  private setAsync = promisify(this.client.setex).bind(this.client);
  private getAsync = promisify(this.client.get).bind(this.client);

  constructor(
    options: {
      defaultExpiry?: number;
      sessionPrefix?: string;
      logger?: Logger;
    } = {}
  ) {
    super(options.logger);
    this.defaultExpiry = options.defaultExpiry || 600;
    this.sessionPrefix = options.sessionPrefix || `${Math.random()}`;
  }

  private genKey(key: string): string {
    return "gowon:" + key;
  }

  private genSessionKey(message: Message, key: string): string {
    return `${this.sessionPrefix}-${message.author.id}:${message.guild
      ?.id!}-${key}`;
  }

  private handleRedisError(error: RedisError): void {
    this.client.quit();
    this.client = redis.createClient();
    this.init();
    throw error;
  }

  async init() {
    await promisify(this.client.on).bind(this.client)("ready");

    this.client.on("error", this.handleRedisError);
  }

  async set(key: string, value: any, expiresAfter?: number) {
    await this.setAsync(
      this.genKey(key),
      expiresAfter || this.defaultExpiry,
      value ?? ""
    );
  }

  async get(key: string): Promise<string | undefined> {
    return (await this.getAsync(this.genKey(key))) ?? undefined;
  }

  delete(key: string) {
    this.client.del(this.genKey(key));
  }

  async sessionGet(message: Message, key: string) {
    return this.get(this.genSessionKey(message, key));
  }

  async sessionSet(message: Message, key: string, value: any) {
    return this.set(this.genSessionKey(message, key), value);
  }

  async sessionDelete(message: Message, key: string) {
    return this.delete(this.genSessionKey(message, key));
  }

  public encodeDate(date: Date): string {
    return `${date.getTime()}`;
  }

  public parseDate(date: string): Date {
    return fromUnixTime(parseInt(date) / 1000);
  }
}
