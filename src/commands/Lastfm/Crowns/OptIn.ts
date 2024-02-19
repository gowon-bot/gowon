import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { WarningEmbed } from "../../../lib/ui/embeds/WarningEmbed";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class OptIn extends CrownsChildCommand {
  idSeed = "wjsn yeoreum";

  description = "Opts you back into the crowns game";
  usage = "";

  slashCommand = true;

  async run() {
    const embed = new WarningEmbed().setDescription(
      "Are you sure you want to opt back into the crowns game?"
    );

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
      await this.crownsService.optIn(this.ctx, this.author.id);

      await embed
        .convert(SuccessEmbed)
        .setDescription(`Opted you back into the crowns game!`)
        .editMessage(this.ctx);
    }
  }
}
