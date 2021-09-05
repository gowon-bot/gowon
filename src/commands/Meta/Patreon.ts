import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class Patreon extends BaseCommand {
  idSeed = "hello venus yeoreum";

  subcategory = "about";
  description = "Displays the link to sign up for Patreon";
  aliases = ["pat"];

  async run() {
    await this.send(
      Emoji.gowonPatreon,
      this.newEmbed().setDescription(
        `You can support me at: https://www.patreon.com/gowon_
Anything is appreciated!`
      )
    );
  }
}
