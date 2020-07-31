import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { jumbleRedisKey, JumbledArtist } from "./JumbleParentCommand";
import { LogicError } from "../../../errors";
import { shuffle } from "../../../helpers";

export class Hint extends JumbleChildCommand {
  description = "Gives you a hint on the current jumble";

  async run(message: Message) {
    let jumbledArtist = await this.sessionGetJSON<JumbledArtist>(
      message,
      jumbleRedisKey
    );

    if (!jumbledArtist.jumbled)
      throw new LogicError("you haven't jumbled an artist yet!");

    let hint = this.generateHint(jumbledArtist);
    let noNewHint =
      hint.split("").filter((c) => c === "_").length ===
      jumbledArtist.currenthint.split("").filter((c) => c === "_").length;

    jumbledArtist.currenthint = hint;

    this.sessionSetJSON(message, jumbleRedisKey, jumbledArtist);

    let embed = new MessageEmbed()
      .setAuthor(
        `Hint for ${message.member?.nickname}`,
        message.author.avatarURL() ?? ""
      )
      .setDescription(
        (noNewHint ? `_You've reached the maximum amount of hints!_\n\n` : "") +
          `${jumbledArtist.jumbled.code()}
      ${jumbledArtist.currenthint.code()}`
      );

    await message.channel.send(embed);
  }

  private generateHint(jumble: JumbledArtist, number = 2): string {
    let acceptablePositions = jumble.currenthint
      .split("")
      .reduce((acc: Array<number>, char: string, idx: number) => {
        if (char === "_") {
          acc.push(idx);
        }
        return acc;
      }, [] as Array<number>);

    acceptablePositions = shuffle(acceptablePositions);

    let generatedHint = jumble.currenthint;
    let unjumbledLength = jumble.unjumbled.split("").filter((c) => c !== " ")
      .length;

    for (
      let i = 0;
      i <
      (acceptablePositions.length < number
        ? acceptablePositions.length
        : number);
      i++
    ) {
      if (
        generatedHint.split("").filter((c) => ![" ", "_"].includes(c)).length +
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
