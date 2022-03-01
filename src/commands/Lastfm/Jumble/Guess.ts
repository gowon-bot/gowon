import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { shuffle } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";

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
      this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

      await this.reply(
        `You are correct! The artist was ${jumbledArtist.unjumbled.strong()}`
      );
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
