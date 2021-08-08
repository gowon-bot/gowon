import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { shuffle } from "../../../helpers";

const args = {
  inputs: { guess: { index: { start: 0 } } },
} as const;

export class Guess extends JumbleChildCommand<typeof args> {
  idSeed = "clc yeeun";

  description = "Picks an artist from your library to jumble";
  usage = ["artist_guess"];

  arguments: Arguments = args;

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
      this.redisService.sessionDelete(
        this.author.id,
        this.guild.id,
        jumbleRedisKey
      );

      await this.reply(
        `you are correct! The artist was ${jumbledArtist.unjumbled.strong()}`
      );
    } else {
      await this.message.react(
        shuffle(["😔", "😖", "😠", "😕", "😣", "😐", "😪"])[0]
      );
    }
  }
}
