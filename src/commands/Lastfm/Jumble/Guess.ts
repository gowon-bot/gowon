import { LogicError } from "../../../errors/errors";
import { shuffle } from "../../../helpers/native/array";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { JumbleChildCommand } from "./JumbleChildCommand";
import { JumbledArtist, jumbleRedisKey } from "./JumbleParentCommand";

const args = {
  guess: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "Your guess for what the artist is",
  }),
} satisfies ArgumentsMap;

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

    if (this.isGuessCorrect(guess, jumbledArtist.unjumbled)) {
      await this.handleCorrectGuess(jumbledArtist.unjumbled, jumbleRedisKey);
    } else {
      if (this.payload.isMessage()) {
        await this.payload.source.react(shuffle(this.wrongAnswerEmojis)[0]);
      } else if (this.payload.isInteraction()) {
        this.send(shuffle(this.wrongAnswerEmojis)[0], {
          ephemeral: true,
        });
      }
    }
  }
}
