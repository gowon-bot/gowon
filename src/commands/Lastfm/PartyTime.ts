import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import { LogicError } from "../../errors";

export default class PartyTime extends LastFMBaseCommand {
  aliases = ["pt"];
  description = "Shows the cover for an album";
  usage = ["", "partytime"];

  arguments: Arguments = {
    inputs: {
      time: { index: 0, regex: /[0-9]{1,2}/, number: true, default: 10 },
    },
  };

  async run() {
    let time = this.parsedArguments.time as number;

    if (time < 5 || time > 15)
      throw new LogicError("Please enter a reasonable time. 😐");

    await this.send("The party begins in...".bold());

    for (let currentTime = time; currentTime >= 0; currentTime--) {
      setTimeout(() => {
        this.send(
          currentTime === 0 ? "🎉 NOW 🎊".bold() : `${currentTime}`.bold()
        );
      }, (time - currentTime) * 1200);
    }
  }
}
