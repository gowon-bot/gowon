import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { Message } from "discord.js";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { Arguments } from "../../../lib/arguments/arguments";
import { RedisService } from "../../../services/redis/RedisService";

export abstract class JumbleChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  redisService = new RedisService(this.logger, {
    prefix: "jumble",
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
