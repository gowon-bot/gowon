import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Pong extends BaseCommand {
  description = "!gnoP !gniP";
  secretCommand = true;

  async run() {
    await this.reply("🏓 gniP");
  }
}
