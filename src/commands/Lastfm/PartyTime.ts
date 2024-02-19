import { bold } from "../../helpers/discord";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  time: new NumberArgument({
    default: 5,
    description: "The amount of seconds to count down - defaults to 5",
  }),
} satisfies ArgumentsMap;

export default class PartyTime extends LastFMBaseCommand<typeof args> {
  idSeed = "april chaewon";

  subcategory = "fun";
  aliases = ["pt"];
  description = "Counts down from a given number";
  usage = ["", "partytime"];

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    time: new validators.RangeValidator({
      min: 3,
      max: 15,
      message: `Please enter a reasonable time. ${Emoji.neutralFace}`,
    }),
  };

  async run() {
    const time = this.parsedArguments.time;

    await this.reply(bold("The party begins in..."));

    for (let currentTime = time; currentTime >= 0; currentTime--) {
      setTimeout(() => {
        this.send(
          currentTime === 0
            ? bold(`${Emoji.tada} NOW ${Emoji.confettiBall}`)
            : bold(`${currentTime}`),
          { forceNoInteractionReply: true }
        );
      }, (time - currentTime) * 1800);
    }
  }
}
