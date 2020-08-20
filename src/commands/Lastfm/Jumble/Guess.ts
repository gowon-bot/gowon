import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message } from "discord.js";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { shuffle } from "../../../helpers";

export class Guess extends JumbleChildCommand {
  description = "Picks an artist from your library to jumble";
  usage = ["artist_guess"];

  arguments: Arguments = {
    inputs: { guess: { index: { start: 0 } } },
  };

  async run(message: Message) {
    let guess = this.parsedArguments.guess as string;

    let jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      message,
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");
    if (!guess) throw new LogicError("please make a guess");

    if (
      guess.toLowerCase().replace(/\s+/g, " ") ===
      jumbledArtist.unjumbled.toLowerCase().replace(/\s+/g, " ")
    ) {
      this.redisService.sessionDelete(message, jumbleRedisKey);

      await message.reply(
        `you are correct! The artist was ${jumbledArtist.unjumbled.bold()}`
      );
    } else {
      await message.react(
        shuffle(["😔", "😖", "😠", "😕", "😣", "😐", "😪"])[0]
      );
      message.channel.stopTyping();
    }
  }
}
