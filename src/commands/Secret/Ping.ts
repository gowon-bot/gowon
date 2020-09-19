import { RunAs } from "../../lib/AliasChecker";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  aliases = ["🏓", "pin"];
  description = "Ping! Pong!";
  secretCommand = true;

  async run(_: any, runAs: RunAs) {
    await this.reply(`Pon${runAs.lastString() !== "pin" ? "g" : ""} 🏓`);
  }
}
