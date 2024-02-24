import { Emoji } from "../../../lib/emoji/Emoji";
import { successColour } from "../../../lib/ui/embeds/SuccessEmbed";
import { WarningEmbed } from "../../../lib/ui/embeds/WarningEmbed";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Logout extends LastFMBaseCommand {
  idSeed = "loona gowon";

  description = "Disconnect your Last.fm account from Gowon";
  subcategory = "accounts";
  usage = "";

  slashCommand = true;

  async run() {
    const embed = new WarningEmbed().setDescription(
      `Are you sure you want to log out? This will delete all your stored data!`
    );

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    const confirmation = await confirmationEmbed.awaitConfirmation(this.ctx);

    if (confirmation) {
      await this.usersService.clearUsername(this.ctx, this.author.id);
      await this.lilacUsersService.logout(this.ctx);

      await embed
        .setColour(successColour)
        .setDescription(`${Emoji.checkmark} Logged out successfully.`)
        .editMessage(this.ctx);
    }
  }
}
