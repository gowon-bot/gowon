import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  aliases = ["🏓"];
  description = "Ping! Pong!";
  secretCommand = true;

  async run() {
    await this.reply("Pong 🏓");
  }
}
