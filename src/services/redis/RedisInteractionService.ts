import { BaseService, BaseServiceContext } from "../BaseService";
import redis, { RedisError } from "redis";
import { promisify } from "util";

export class RedisInteractionService extends BaseService {
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

  async set(
    ctx: BaseServiceContext,
    key: string,
    value: any,
    expiresAfter: number
  ) {
    if (!key.includes("-nickname") && !key.includes("-username")) {
      this.log(
        ctx,
        `Setting ${key} as ${value !== undefined ? value : "(no value)"}`
      );
    }

    await this.setAsync(this.genKey(key), expiresAfter, value ?? "");
  }

  async get(ctx: BaseServiceContext, key: string): Promise<string | undefined> {
    this.log(ctx, `Getting ${key}`);

    return (await this.getAsync(this.genKey(key))) ?? undefined;
  }

  delete(ctx: BaseServiceContext, key: string) {
    this.log(ctx, `Deleting ${key}`);

    this.client.del(this.genKey(key));
  }
}
