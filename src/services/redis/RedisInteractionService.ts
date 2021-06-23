import { BaseService } from "../BaseService";
import redis, { RedisError } from "redis";
import { promisify } from "util";

export class RedisInteractionService extends BaseService {
  private static instance: RedisInteractionService | undefined;

  public static getInstance(): RedisInteractionService {
    if (!this.instance) {
      this.instance = new RedisInteractionService();
    }

    return this.instance;
  }

  private constructor() {
    super();
  }

  client = redis.createClient();

  private setAsync = promisify(this.client.setex).bind(this.client);
  private getAsync = promisify(this.client.get).bind(this.client);

  private genKey(key: string): string {
    return "gowon:" + key;
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

  async set(key: string, value: any, expiresAfter: number) {
    await this.setAsync(this.genKey(key), expiresAfter, value ?? "");
  }

  async get(key: string): Promise<string | undefined> {
    return (await this.getAsync(this.genKey(key))) ?? undefined;
  }

  delete(key: string) {
    this.client.del(this.genKey(key));
  }
}
