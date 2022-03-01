import { LastFMBaseCommand } from "./LastFMBaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  time: new NumberArgument({
    default: 5,
    description: "The amount of seconds to count down - defaults to 5",
  }),
} as const;

export default class PartyTime extends LastFMBaseCommand<typeof args> {
  idSeed = "april chaewon";

  subcategory = "fun";
  aliases = ["pt"];
  description = "Counts down from a given number";
  usage = ["", "partytime"];

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    time: new validators.Range({
      min: 3,
      max: 15,
      message: "Please enter a reasonable time. 😐",
    }),
  };

  async run() {
    this.parsedArguments;

    let time = this.parsedArguments.time;

    await this.send("The party begins in...".strong());

    for (let currentTime = time; currentTime >= 0; currentTime--) {
      setTimeout(() => {
        this.send(
          currentTime === 0 ? "🎉 NOW 🎊".strong() : `${currentTime}`.strong(),
          { forceNoInteractionReply: true }
        );
      }, (time - currentTime) * 1800);
    }
  }
}
