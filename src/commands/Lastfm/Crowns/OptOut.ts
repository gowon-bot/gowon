import { bold } from "../../../helpers/discord";
import { displayNumber } from "../../../lib/ui/displays";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { WarningEmbed } from "../../../lib/ui/embeds/WarningEmbed";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class OptOut extends CrownsChildCommand {
  idSeed = "wjsn seola";

  description =
    "Opts you out of the crowns game, deleting all your crowns, and preventing you from getting new ones";
  usage = "";

  slashCommand = true;

  async run() {
    const { dbUser } = await this.getMentions({ dbUserRequired: true });

    const embed = new WarningEmbed().setDescription(
      `Are you sure you want to opt out? This will delete all your crowns!`
    );

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
      await this.crownsService.scribe.optOut(
        this.ctx,
        dbUser,
        this.ctx.payload.member!
      );

      const numberOfCrowns = await this.crownsService.optOut(
        this.ctx,
        this.author.id
      );

      await embed
        .convert(SuccessEmbed)
        .setDescription(
          `Opted you out of the crowns game, deleting ${bold(
            displayNumber(numberOfCrowns, "crown")
          )}!`
        )
        .editMessage(this.ctx);
    }
  }
}
