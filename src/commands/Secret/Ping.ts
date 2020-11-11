import { RunAs } from "../../lib/AliasChecker";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  description = "Ping! Pong!";
  aliases = ["🏓", "pin"];
  secretCommand = true;

  async run(_: any, runAs: RunAs) {
    await this.reply(`Pon${runAs.variationWasUsed("pin") ? "" : "g"} 🏓`);
  }
}
