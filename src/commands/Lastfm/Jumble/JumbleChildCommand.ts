import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { Arguments } from "../../../lib/arguments/arguments";
import { RedisService } from "../../../services/redis/RedisService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export abstract class JumbleChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  redisService = ServiceRegistry.get(RedisService);

  parentName = "jumble";
  subcategory = "jumble";

  hintChar = " ";

  jumbleCalculator!: JumbleCalculator;

  ctx = this.generateContext({
    constants: { redisOptions: { prefix: "jumble" } },
    mutable: {},
  });

  async sessionSetJSON(key: string, value: Object | Array<unknown>) {
    return this.redisService.sessionSet(this.ctx, key, JSON.stringify(value));
  }

  async sessionGetJSON<T extends Object>(key: string): Promise<T> {
    return JSON.parse(
      (await this.redisService.sessionGet(this.ctx, key)) || "{}"
    ) as T;
  }

  async prerun() {
    let senderUsername = await this.usersService.getUsername(
      this.ctx,
      this.message.author.id
    );

    this.jumbleCalculator = new JumbleCalculator(this.ctx, senderUsername);
  }
}
