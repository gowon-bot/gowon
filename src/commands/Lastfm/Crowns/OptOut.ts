import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";
import { displayNumber } from "../../../lib/views/displays";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";

export class OptOut extends CrownsChildCommand {
  idSeed = "wjsn seola";

  description =
    "Opts you out of the crowns game, deleting all your crowns, and preventing you from getting new ones";
  usage = "";

  ctx = this.generateContext({
    crownsService: this.crownsService,
  });

  async run(message: Message) {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crown opt-out"))
      .setDescription(
        `Are you sure you want to opt out? This will delete all your crowns!`
      );

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    if (await confirmationEmbed.awaitConfirmation()) {
      await this.crownsService.scribe.optOut(this.ctx, message.member!);

      const numberOfCrowns = await this.crownsService.optOut(
        this.ctx,
        message.author.id
      );

      await confirmationEmbed.sentMessage?.edit({
        embeds: [
          embed.setDescription(
            `Opted you out, deleting ${displayNumber(
              numberOfCrowns,
              "crown"
            ).strong()}!`
          ),
        ],
      });
    }
  }
}
