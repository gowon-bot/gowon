import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message } from "discord.js";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { shuffle } from "../../../helpers";

export class Guess extends JumbleChildCommand {
  description = "Picks an artist from your library to jumble";

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
      guess.toLowerCase().replace(/\s+/, " ") ===
      jumbledArtist.unjumbled.toLowerCase().replace(/\s+/, " ")
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

// Can You Solve This Artist Name Jumble?
// Who is this artist?

// IAXLEGA 500

// Hints:
// This artist has 403.5k listeners on last.fm and douzed has scrobbled them 5 times overall (#312 on their top artists list for that period).This artist is tagged as "shoegaze" as well as "dream pop". Last.fm considers Mojave 3 and Slowdive to be similar.

// Command executed by douzed#4353•Today at 10:16 PM
