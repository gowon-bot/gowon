import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  idSeed = "loona gowon";

  description = "Disconnect your Last.fm account from Gowon";
  subcategory = "accounts";
  usage = "";

  slashCommand = true;

  async run() {
    const embed = this.authorEmbed()
      .setHeader("Log out")
      .setDescription(
        "Are you sure you want to log out? This will delete all your stored data!"
      );

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    const confirmation = await confirmationEmbed.awaitConfirmation(this.ctx);

    if (confirmation) {
      await this.usersService.clearUsername(this.ctx, this.author.id);
      await this.lilacUsersService.logout(this.ctx);

      if (confirmationEmbed.sentMessage) {
        await this.discordService.edit(
          this.ctx,
          confirmationEmbed.sentMessage,
          embed.setDescription("Logged out successfully.").asEmbed()
        );
      }
    }
  }
}
