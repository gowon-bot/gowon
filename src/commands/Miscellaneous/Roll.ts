import { Chance } from "chance";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { displayNumber } from "../../lib/views/displays";

const args = {
  inputs: {
    min: { index: 0, number: true },
    max: { index: 1, number: true },
  },
} as const;

export default class Roll extends BaseCommand<typeof args> {
  idSeed = "dreamnote eunjo";

  description = "Roll a random number";
  subcategory = "fun";
  usage = ["max", "min max"];

  arguments = args;

  validation: Validation = {
    min: [
      new validators.Required({ message: "Please enter a maximum number!" }),
      new validators.Range({
        min: 1,
        message: "Please enter a number greater than 1",
      }),
    ],
  };

  async run() {
    const min = this.parsedArguments.min,
      max = this.parsedArguments.max;

    const bounds = [];

    if (max && min) {
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
