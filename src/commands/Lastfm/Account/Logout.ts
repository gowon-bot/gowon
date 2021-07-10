import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  idSeed = "loona gowon";

  description = "Unsets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "";

  async run() {
    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Log out"))
      .setDescription(
        "Are you sure you want to log out? This will delete **all** your indexed data!"
      );

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    this.stopTyping();
    const confirmation = await confirmationEmbed.awaitConfirmation();

    if (confirmation) {
      await this.usersService.clearUsername(this.author.id);
      await this.mirrorballService.logout(this.author.id);

      await confirmationEmbed.sentMessage?.edit(
        embed.setDescription("Logged out successfully.")
      );
    }
  }
}
