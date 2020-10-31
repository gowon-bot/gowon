import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class Pong extends BaseCommand {
  description = "!gnoP !gniP";
  secretCommand = true;

  async run() {
    await this.reply(`${Emoji.gnop} gniP`);
  }
}
