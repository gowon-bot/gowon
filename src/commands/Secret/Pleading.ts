import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Pleading extends BaseCommand {
  aliases = ["🥺"];
  description = ":pleading:";
  secretCommand = true;

  async run() {
    await this.send(`​  🥺\n👉👈`);
  }
}
