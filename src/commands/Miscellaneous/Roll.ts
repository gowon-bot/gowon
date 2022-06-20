import { Chance } from "chance";
import { bold } from "../../helpers/discord";
import { Command, Variation } from "../../lib/command/Command";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { displayNumber } from "../../lib/views/displays";

const args = {
  min: new NumberArgument({
    index: 0,
    default: 0,
    description: "The minimum number to roll from",
  }),
  max: new NumberArgument({
    index: 1,
    description: "The maximum number to roll to",
  }),
} as const;

export default class Roll extends Command<typeof args> {
  idSeed = "dreamnote eunjo";

  description = "Roll a random number";
  subcategory = "fun";
  usage = ["max", "min max"];

  variations: Variation[] = [
    {
      name: "yesno",
      variation: "yesno",
      description: "Ask and Gowon will respond with yes or no!",
      separateSlashCommand: true,
      overrideArgs: {},
    },
    {
      name: "coinflip",
      variation: ["coinflip", "flipacoin", "flipp!ngacoin"],
      description: "Flips a coin",
    },
  ];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    min: [
      new validators.Range({
        min: 1,
        message: "Please enter a number greater than 1",
      }),
    ],
  };

  parseArguments() {
    if (this.variationWasUsed("yesno", "coinflip")) {
      return { min: 1, max: 2 };
    } else {
      return super.parseArguments();
    }
  }

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
      bounds.push(1, min || max);
    }

    const number = Chance().natural({ min: bounds[0], max: bounds[1] });

    if (this.variationWasUsed("yesno")) {
      await this.reply(number === 1 ? "Yes" : "No");
    } else if (this.variationWasUsed("coinflip")) {
      await this.reply(number === 1 ? "Heads" : "Tails");
    } else {
      await this.reply(`You rolled a ${bold(displayNumber(number))}`);
    }
  }
}
