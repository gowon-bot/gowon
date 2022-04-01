import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors/errors";
import { shuffle } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { bold } from "../../../helpers/discord";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CardsService } from "../../../services/dbservices/CardsService";
import { Chance } from "chance";
import { displayNumber } from "../../../lib/views/displays";
import { Emoji } from "../../../lib/Emoji";

const args = {
  guess: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "Your guess for what the artist is",
  }),
} as const;

export class Guess extends JumbleChildCommand<typeof args> {
  idSeed = "clc yeeun";

  description = "Picks an artist from your library to jumble";
  usage = ["artist_guess"];

  arguments = args;

  slashCommand = true;

  cardsService = ServiceRegistry.get(CardsService);

  async run() {
    const { dbUser } = await this.getMentions({ senderRequired: true });

    let guess = this.parsedArguments.guess;

    let jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError(
        `you haven't jumbled an artist yet, to jumble an artist, run \`${this.prefix}jumble me\`!`
      );
    if (!guess) throw new LogicError("please make a guess");

    if (
      guess.toLowerCase().replace(/\s+/g, " ") ===
      jumbledArtist.unjumbled.toLowerCase().replace(/\s+/g, " ")
    ) {
      const earned = Chance().natural({ min: 3, max: 5 });
      const bankAccount = await this.cardsService.changeBankAccount(
        this.ctx,
        dbUser,
        earned
      );

      this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Jumble guess"))
        .setDescription(
          `You are correct! The artist was ${bold(jumbledArtist.unjumbled)}
Earned ${Emoji.fip}${displayNumber(earned)}! You now have ${Emoji.fip}${
            bankAccount.amount
          }`
        );

      await this.send(embed);
    } else {
      if (this.payload.isMessage()) {
        await this.payload.source.react(
          shuffle(["😔", "😖", "😠", "😕", "😣", "😐", "😪"])[0]
        );
      } else if (this.payload.isInteraction()) {
        this.send(shuffle(["😔", "😖", "😠", "😕", "😣", "😐", "😪"])[0], {
          ephemeral: true,
        });
      }
    }
  }
}
