import { Chance } from "chance";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  idSeed = "blackpink lisa";

  subcategory = "developer";
  description = "Ping! Pong!";
  aliases = ["🏓", "pin", "pingu", "pung", "peng"];
  secretCommand = true;

  async run() {
    if (this.runAs.variationWasUsed("pung")) {
      // PUNG! by Yukika
      await this.reply(
        "https://open.spotify.com/track/2YnPNuWGG3zlwyUyG0hBOd",
        { noUppercase: true }
      );
    } else if (this.runAs.variationWasUsed("peng")) {
      await this.reply("ting", { noUppercase: true });
    } else if (
      this.runAs.variationWasUsed("ping") &&
      Chance().bool({ likelihood: 20 })
    ) {
      await this.reply("PANG! 🏌️");
    } else {
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
}
