import { JumbleChildCommand } from "./JumbleChildCommand";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { shuffle } from "../../../helpers";

export class Hint extends JumbleChildCommand {
  idSeed = "clc elkie";

  description = "Gives you a hint on the current jumble";
  usage = "";

  async run() {
    const jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");

    const hint = this.generateHint(jumbledArtist);
    const noNewHint =
      hint.split("").filter((c) => c === this.hintChar).length ===
      jumbledArtist.currenthint.split("").filter((c) => c === this.hintChar)
        .length;

    jumbledArtist.currenthint = hint;

    this.sessionSetJSON(jumbleRedisKey, jumbledArtist);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Jumble hint"))
      .setDescription(
        (noNewHint ? `_You've reached the maximum amount of hints!_\n\n` : "") +
          `${jumbledArtist.jumbled.code()}
      ${jumbledArtist.currenthint.code()}`
      );

    await this.send(embed);
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
