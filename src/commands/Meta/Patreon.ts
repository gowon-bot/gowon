import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/emoji/Emoji";

export default class Patreon extends Command {
  idSeed = "hello venus yeoreum";

  subcategory = "about";
  description = "Displays the link to sign up for Patreon";
  aliases = ["pat", "donate"];

  async run() {
    const embed = this.newEmbed().setDescription(
      `You can support me at: https://www.patreon.com/gowon_
Anything is appreciated!`
    );

    await this.send(Emoji.gowonPatreon, { withEmbed: embed });
  }
}
