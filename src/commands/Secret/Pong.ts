import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/Emoji";

export default class Pong extends Command {
  idSeed = "2ne1 dara";

  aliases = ["nop"];

  subcategory = "fun";
  description = "!gnoP !gniP";
  secretCommand = true;

  async run() {
    await this.reply(
      `${Emoji.gnop} ${!this.runAs.variationWasUsed("nop") ? "g" : ""}niP`,
      {
        ping: true,
      }
    );
  }
}
