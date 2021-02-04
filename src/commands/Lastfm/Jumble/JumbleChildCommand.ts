import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { Message } from "discord.js";
import { RedisService } from "../../../services/RedisService";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { Arguments } from "../../../lib/arguments/arguments";

export abstract class JumbleChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  redisService = new RedisService({
    logger: this.logger,
    sessionPrefix: "jumble",
  });
  parentName = "jumble";
  subcategory = "jumble";

  hintChar = " ";

  jumbleCalculator!: JumbleCalculator;

  async sessionSetJSON(
    message: Message,
    key: string,
    value: Object | Array<unknown>
  ) {
    return this.redisService.sessionSet(message, key, JSON.stringify(value));
  }

  async sessionGetJSON<T extends Object>(
    message: Message,
    key: string
  ): Promise<T> {
    return JSON.parse(
      (await this.redisService.sessionGet(message, key)) || "{}"
    ) as T;
  }

  async prerun(message: Message) {
    let senderUsername = await this.usersService.getUsername(message.author.id);

    this.jumbleCalculator = new JumbleCalculator(
      senderUsername,
      this.lastFMService
    );
  }
}
