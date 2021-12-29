import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";

export class OptIn extends CrownsChildCommand {
  idSeed = "wjsn yeoreum";

  description = "Opts you back into the crowns game";
  usage = "";

  async run(message: Message) {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crowns opt-in"))
      .setDescription(
        "Are you sure you want to opt back into the crowns game?"
      );

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation()) {
      await this.crownsService.optIn(this.ctx, message.author.id);

      await confirmationEmbed.sentMessage?.edit({
        embeds: [embed.setDescription("Opted you back in!")],
      });
    }
  }
}
