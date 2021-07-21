import { Chance } from "chance";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { RunAs } from "../../lib/command/RunAs";

export default class Ping extends BaseCommand {
  idSeed = "blackpink lisa";

  subcategory = "developer";
  description = "Ping! Pong!";
  aliases = ["🏓", "pin", "pingu"];
  secretCommand = true;

  async run(_: any, runAs: RunAs) {
    if (Chance().bool({ likelihood: 20 })) {
      await this.reply("PANG! 🏌️");
      return;
    }

    await this.reply(
      `Pon${
        runAs.variationWasUsed("pingu")
          ? "gu"
          : runAs.variationWasUsed("pin")
          ? ""
          : "g"
      } 🏓`,
      {
        ping: false,
      }
    );
  }
}
