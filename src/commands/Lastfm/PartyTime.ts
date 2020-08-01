import { Message } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import { LogicError } from "../../errors";

export default class PartyTime extends LastFMBaseCommand {
  aliases = ["pt"];
  description = "Shows the cover for an album";
  arguments: Arguments = {
    inputs: {
      time: { index: 0, regex: /[0-9]{1,2}/ },
    },
  };

  async run(message: Message) {
    let time = (this.parsedArguments.time as string)?.toInt() || 10;

    if (time < 5 || time > 15)
      throw new LogicError("Please enter a reasonable time. 😐");

    await message.channel.send("The party begins in...".bold());

    for (let currentTime = time; currentTime >= 0; currentTime--) {
      setTimeout(() => {
        message.channel.send(
          currentTime === 0 ? "🎉 NOW 🎊".bold() : `${currentTime}`.bold()
        );

      }, (time - currentTime) * 1200);
    }
  }
}
