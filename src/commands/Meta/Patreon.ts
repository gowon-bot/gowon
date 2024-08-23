import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/emoji/Emoji";

export default class Patreon extends Command {
  idSeed = "hello venus yeoreum";

  subcategory = "about";
  description = "Displays the link to sign up for Patreon";
  aliases = ["donate", "backer"];

  async run() {
    const embed = this.minimalEmbed().setDescription(
      `${Emoji.gowonPatreon} You can support me at: https://www.patreon.com/gowon_
Anything is appreciated!

This unlocks backer features on the bot, such as:
- Full scrobbles indexing
- Custom album art
- More to come!`
    );

    await this.reply(embed);
  }
}
