import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { RedisService } from "../../../services/redis/RedisService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { bold } from "../../../helpers/discord";

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

  wrongAnswerEmojis = ["😔", "😖", "😠", "😕", "😣", "😐", "😪"];

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

  isGuessCorrect(guess: string, artistName: string): boolean {
    return (
      guess.toLowerCase().replace(/\s+/g, " ") ===
      artistName.toLowerCase().replace(/\s+/g, " ")
    );
  }

  async handleCorrectGuess(artistName: string, jumbleKey: string) {
    this.redisService.sessionDelete(this.ctx, jumbleKey);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Jumble guess"))
      .setDescription(`You are correct! The artist was ${bold(artistName)}`);

    await this.send(embed);
  }

  async stopJumble(artistName: string, jumbleKey: string) {
    this.redisService.sessionDelete(this.ctx, jumbleKey);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Jumble"))
      .setDescription(`The artist was ${bold(artistName)}!`);

    await this.send(embed);
  }
}
