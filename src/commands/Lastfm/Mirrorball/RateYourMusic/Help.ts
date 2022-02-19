import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

export class Help extends RateYourMusicChildCommand {
  idSeed = "shasha subin";

  description = "Help on how to import your rateyourmusic ratings";

  async run() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Rateyourmusic import help"))
      .setDescription(
        `You can export your rateyourmusic data by going to your profile page, and at the very botton of the page clicking the "Export your data" button.
        
To import your ratings, you can do one of two things:

- Copy the entire page, then paste it into Discord with \`${this.prefix}rymimport \`, Discord will convert it to a file for you (if not Gowon will still handle it). Or,

- Download the export as a file, and then attatch it in Discord with \`${this.prefix}rymimport\``
      );

    await this.send(embed);
  }
}
