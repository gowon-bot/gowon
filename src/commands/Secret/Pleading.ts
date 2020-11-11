import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Pleading extends BaseCommand {
  description = ":pleading:";
  aliases = ["🥺"];
  secretCommand = true;

  async run() {
    await this.send(`​  🥺\n👉👈`);
  }
}
