import { Chance } from "chance";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  idSeed = "blackpink lisa";

  subcategory = "developer";
  description = "Ping! Pong!";
  aliases = ["🏓", "pin", "pingu"];
  secretCommand = true;

  async run() {
    if (
      this.runAs.variationWasUsed("ping") &&
      Chance().bool({ likelihood: 20 })
    ) {
      await this.reply("PANG! 🏌️");
      return;
    }

    await this.reply(
      `Pon${
        this.runAs.variationWasUsed("pingu")
          ? "gu"
          : this.runAs.variationWasUsed("pin")
          ? ""
          : "g"
      } 🏓`,
      {
        ping: false,
      }
    );
  }
}
