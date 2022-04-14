import { BaseService } from "../BaseService";
import config from "../../../config.json";
import { GowonContext } from "../../lib/context/Context";
import { createClient } from "redis";

export class RedisInteractionService extends BaseService {
  client = createClient({
    socket: {
      host: config.redisHost,
    },
  });

  private genKey(key: string): string {
    return "gowon:" + key;
  }

  private handleRedisError(error: Error): void {
    this.client.quit();
    this.client = createClient({ url: config.redisHost });
    this.init();
    throw error;
  }

  async init(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this.client.on("ready", () => {
        resolve();
      });

      this.client.on("error", (e) => {
        throw e;
      });
    });

    await this.client.connect();

    this.client.on("error", this.handleRedisError.bind(this));

    return promise;
  }

  async set(ctx: GowonContext, key: string, value: any, expiresAfter: number) {
    if (!key.includes("-nickname") && !key.includes("-username")) {
      this.log(
        ctx,
        `Setting ${key} as ${value !== undefined ? value : "(no value)"}`
      );
    }

    await this.client.set(this.genKey(key), value ?? "", { EX: expiresAfter });
  }

  async get(ctx: GowonContext, key: string): Promise<string | undefined> {
    this.log(ctx, `Getting ${key}`);

    return (await this.client.get(this.genKey(key))) ?? undefined;
  }

  async keys(pattern: string): Promise<string[]> {
    return (await this.client.keys(this.genKey(pattern))) ?? undefined;
  }

  async getMany(
    ctx: GowonContext,
    keys: string[]
  ): Promise<Array<string | null>> {
    this.log(ctx, `Getting many with ${keys.length} keys`);

    if (!keys.length) return [];

    return await this.client.mGet(keys);
  }

  async delete(ctx: GowonContext, key: string): Promise<void> {
    this.log(ctx, `Deleting ${key}`);

    await this.client.del(this.genKey(key));
  }
}
