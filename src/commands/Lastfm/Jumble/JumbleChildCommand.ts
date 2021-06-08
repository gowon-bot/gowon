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

  async sessionSetJSON(key: string, value: Object | Array<unknown>) {
    return this.redisService.sessionSet(
      this.author.id,
      this.guild.id,
      key,
      JSON.stringify(value)
    );
  }

  async sessionGetJSON<T extends Object>(key: string): Promise<T> {
    return JSON.parse(
      (await this.redisService.sessionGet(
        this.author.id,
        this.guild.id,
        key
      )) || "{}"
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
