import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class OptIn extends CrownsChildCommand {
  idSeed = "wjsn yeoreum";

  description = "Opts you back into the crowns game";
  usage = "";

  slashCommand = true;

  async run() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns opt-in"))
      .setDescription(
        "Are you sure you want to opt back into the crowns game?"
      );

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
      await this.crownsService.optIn(this.ctx, this.author.id);

      await confirmationEmbed.sentMessage?.edit({
        embeds: [embed.setDescription("Opted you back in!")],
      });
    }
  }
}
