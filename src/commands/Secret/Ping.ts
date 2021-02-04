import { BaseCommand } from "../../lib/command/BaseCommand";
import { RunAs } from "../../lib/command/RunAs";

export default class Ping extends BaseCommand {
  idSeed = "blackpink lisa";

  description = "Ping! Pong!";
  aliases = ["🏓", "pin"];
  secretCommand = true;

  async run(_: any, runAs: RunAs) {
    await this.reply(`Pon${runAs.variationWasUsed("pin") ? "" : "g"} 🏓`);
  }
}
