import { shuffle } from "../../../helpers";
import { bold, code } from "../../../helpers/discord";
import { JumbleCalculator } from "../../../lib/calculators/JumbleCalculator";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { errorColour } from "../../../lib/ui/embeds/ErrorEmbed";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RedisService } from "../../../services/redis/RedisService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { JumbledArtist } from "./JumbleParentCommand";

export abstract class JumbleChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  protected readonly maximumJumbleTries = 50;

  redisService = ServiceRegistry.get(RedisService);

  parentName = "jumble";
  subcategory = "jumble";

  hintChar = " ";

  jumbleCalculator!: JumbleCalculator;

  customContext = {
    constants: { redisOptions: { prefix: "jumble" } },
  };

  wrongAnswerEmojis = [
    Emoji.pensive,
    Emoji.disappointed,
    Emoji.angry,
    Emoji.slighted,
    Emoji.worried,
    Emoji.neutral,
    Emoji.sighing,
  ];

  async sessionSetJSON(key: string, value: Object | Array<unknown>) {
    return this.redisService.sessionSet(this.ctx, key, JSON.stringify(value));
  }

  async sessionGetJSON<T extends Object>(key: string): Promise<T> {
    return JSON.parse(
      (await this.redisService.sessionGet(this.ctx, key)) || "{}"
    ) as T;
  }

  async beforeRun() {
    const senderUsername = await this.usersService.getUsername(
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

    const embed = new SuccessEmbed().setDescription(
      `You are correct! The artist was ${bold(artistName)}`
    );

    await this.reply(embed);
  }

  async stopJumble(artistName: string, jumbleKey: string) {
    this.redisService.sessionDelete(this.ctx, jumbleKey);

    const embed = this.minimalEmbed()
      .setColour(errorColour)
      .setDescription(`Too bad, the artist was ${bold(artistName)}!`);

    await this.reply(embed);
  }

  async giveHint(jumbledArtist: JumbledArtist, jumbleKey: string) {
    const hint = this.generateHint(jumbledArtist);
    const noNewHint =
      hint.split("").filter((c) => c === this.hintChar).length ===
      jumbledArtist.currenthint.split("").filter((c) => c === this.hintChar)
        .length;

    jumbledArtist.currenthint = hint;

    this.sessionSetJSON(jumbleKey, jumbledArtist);

    const embed = this.minimalEmbed().setDescription(
      (noNewHint ? `_You've reached the maximum amount of hints!_\n\n` : "") +
        `${code(jumbledArtist.jumbled)}
      ${code(jumbledArtist.currenthint)}`
    );

    await this.reply(embed);
  }

  private generateHint(jumble: JumbledArtist, number = 3): string {
    let acceptablePositions = jumble.currenthint
      .split("")
      .reduce((acc, char, idx) => {
        if (char === this.hintChar) {
          acc.push(idx);
        }
        return acc;
      }, [] as Array<number>);

    acceptablePositions = shuffle(acceptablePositions);

    let generatedHint = jumble.currenthint;
    const unjumbledLength = jumble.unjumbled
      .split("")
      .filter((c) => c !== " ").length;

    for (
      let i = 0;
      i <
      (acceptablePositions.length < number
        ? acceptablePositions.length
        : number);
      i++
    ) {
      if (
        generatedHint.split("").filter((c) => ![" ", this.hintChar].includes(c))
          .length +
          (unjumbledLength < 8 ? 3 : unjumbledLength > 12 ? 6 : 4) >=
        unjumbledLength
      )
        break;

      let splitHint = generatedHint.split("");
      splitHint[acceptablePositions[i]] = jumble.unjumbled.charAt(
        acceptablePositions[i]
      );
      generatedHint = splitHint.join("");
    }

    return generatedHint;
  }
}
