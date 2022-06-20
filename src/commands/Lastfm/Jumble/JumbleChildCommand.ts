import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { RedisService } from "../../../services/redis/RedisService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class JumbleChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  redisService = ServiceRegistry.get(RedisService);

  parentName = "jumble";
  subcategory = "jumble";

  hintChar = " ";

  jumbleCalculator!: JumbleCalculator;

  customContext = {
    constants: { redisOptions: { prefix: "jumble" } },
  };

  async sessionSetJSON(key: string, value: Object | Array<unknown>) {
    return this.redisService.sessionSet(this.ctx, key, JSON.stringify(value));
  }

  async sessionGetJSON<T extends Object>(key: string): Promise<T> {
    return JSON.parse(
      (await this.redisService.sessionGet(this.ctx, key)) || "{}"
    ) as T;
  }

  async beforeRun() {
    let senderUsername = await this.usersService.getUsername(
      this.ctx,
      this.payload.author.id
    );

    this.jumbleCalculator = new JumbleCalculator(this.ctx, senderUsername);
  }
}
