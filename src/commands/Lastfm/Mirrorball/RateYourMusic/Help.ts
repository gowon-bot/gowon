import { HelpEmbed } from "../../../../lib/ui/embeds/HelpEmbed";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

export class Help extends RateYourMusicChildCommand {
  idSeed = "shasha subin";

  description = "Help on how to import your rateyourmusic ratings";

  slashCommand = true;

  async run() {
    const embed = new HelpEmbed()
      .setHeader("RateYourMusic import help")
      .setDescription(
        `You can export your rateyourmusic data by going to your profile page, and at the very botton of the page clicking the "Export your data" button.

Once completing the Captcha and downloading the \`.csv\` file, upload it to discord along with \`${this.prefix}rymimport\``
      );

    await this.reply(embed);
  }
}
