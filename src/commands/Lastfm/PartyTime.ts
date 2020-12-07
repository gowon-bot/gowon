import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";

export default class PartyTime extends LastFMBaseCommand {
  idSeed = "april chaewon";
  
  aliases = ["pt"];
  description = "Counts down from a given number";
  usage = ["", "partytime"];

  arguments: Arguments = {
    inputs: {
      time: { index: 0, regex: /[0-9]+/, number: true, default: 5 },
    },
  };

  validation: Validation = {
    time: new validators.Range({
      min: 3,
      max: 15,
      message: "Please enter a reasonable time. 😐",
    }),
  };

  async run() {
    let time = this.parsedArguments.time as number;

    await this.send("The party begins in...".strong());

    for (let currentTime = time; currentTime >= 0; currentTime--) {
      setTimeout(() => {
        this.send(
          currentTime === 0 ? "🎉 NOW 🎊".strong() : `${currentTime}`.strong()
        );
      }, (time - currentTime) * 1800);
    }
  }
}
