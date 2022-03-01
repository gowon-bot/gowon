import { Chance } from "chance";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";
// import { Validation } from "../../lib/validation/ValidationChecker";
// import { validators } from "../../lib/validation/validators";
import { displayNumber } from "../../lib/views/displays";

const args = {
  min: new NumberArgument({
    index: 0,
    default: 0,
    description: "The minimum number to roll from",
  }),
  max: new NumberArgument({
    index: 1,
    required: true,
    description: "The maximum number to roll to",
  }),
} as const;

export default class Roll extends BaseCommand<typeof args> {
  idSeed = "dreamnote eunjo";

  description = "Roll a random number";
  subcategory = "fun";
  usage = ["max", "min max"];

  arguments = args;

  slashCommand = true;

  // validation: Validation = {
  //   min: [
  //     new validators.Required({ message: "Please enter a maximum number!" }),
  //     new validators.Range({
  //       min: 1,
  //       message: "Please enter a number greater than 1",
  //     }),
  //   ],
  // };

  async run() {
    const min = this.parsedArguments.min,
      max = this.parsedArguments.max;

    const bounds = [];

    if (max !== undefined && min !== undefined) {
      if (max < min) {
        bounds.push(max, min);
      } else {
        bounds.push(min, max);
      }
    } else {
      bounds.push(1, min);
    }

    const number = Chance().natural({ min: bounds[0], max: bounds[1] });

    await this.reply(`You rolled a ${displayNumber(number).strong()}`);
  }
}
