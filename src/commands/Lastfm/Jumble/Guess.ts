import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors/errors";
import { shuffle } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { bold } from "../../../helpers/discord";

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

  async run() {
    const guess = this.parsedArguments.guess;

    const jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
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
      this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Jumble guess"))
        .setDescription(
          `You are correct! The artist was ${bold(jumbledArtist.unjumbled)}`
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
