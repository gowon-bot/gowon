import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

export class Help extends RateYourMusicChildCommand {
  idSeed = "shasha subin";

  description = "Help on how to import your rateyourmusic ratings";

  slashCommand = true;

  async run() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Rateyourmusic import help"))
      .setDescription(
        `You can export your rateyourmusic data by going to your profile page, and at the very botton of the page clicking the "Export your data" button.
        
To import your ratings, you can do one of two things:

- Copy paste the ratings, then visit https://gowon.ca/import-ratings to import them (works on mobile!)

- Copy the entire page, then paste it into Discord with \`${this.prefix}rymimport \`, sDiscord will convert it to a file for you (if not Gowon will still handle it)`
      );

    await this.send(embed);
  }
}
