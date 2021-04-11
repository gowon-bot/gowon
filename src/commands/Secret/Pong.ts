import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class Pong extends BaseCommand {
  idSeed = "2ne1 dara";

  description = "!gnoP !gniP";
  secretCommand = true;

  async run() {
    await this.reply(`${Emoji.gnop} gniP`, { ping: true });
  }
}
