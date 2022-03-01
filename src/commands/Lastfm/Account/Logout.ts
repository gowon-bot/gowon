import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  idSeed = "loona gowon";

  description = "Disconnect your Last.fm account from Gowon";
  subcategory = "accounts";
  usage = "";

  slashCommand = true;

  async run() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Log out"))
      .setDescription(
        "Are you sure you want to log out? This will delete **all** your downloaded data!"
      );

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    const confirmation = await confirmationEmbed.awaitConfirmation(this.ctx);

    if (confirmation) {
      await this.usersService.clearUsername(this.ctx, this.author.id);
      await this.mirrorballService.logout(this.ctx);

      if (confirmationEmbed.sentMessage) {
        await this.discordService.edit(
          this.ctx,
          confirmationEmbed.sentMessage,
          embed.setDescription("Logged out successfully.")
        );
      }
    }
  }
}
