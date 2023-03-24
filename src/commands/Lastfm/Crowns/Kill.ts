import { CrownDoesntExistError } from "../../../errors/crowns";
import { bold } from "../../../helpers/discord";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...prefabArguments.requiredArtist,
} satisfies ArgumentsMap;

export class Kill extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn xuanyi";

  description = "Kills a crown";
  usage = ["artist (case sensitive!)"];

  adminCommand = true;

  arguments = args;

  async run() {
    const artist = this.parsedArguments.artist;

    const crown = await this.crownsService.getCrown(this.ctx, artist, {
      noRedirect: true,
      caseSensitive: true,
    });

    if (!crown) {
      throw new CrownDoesntExistError(artist, true);
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Kill crown"))
      .setDescription(
        `Are you sure you want to kill the crown for ${bold(crown.artistName)}?`
      );

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
      await this.crownsService.killCrown(this.ctx, artist);
      this.crownsService.scribe.kill(this.ctx, crown, this.author);

      await this.send(
        this.newEmbed()
          .setAuthor(this.generateEmbedAuthor("Kill crown"))
          .setDescription(`Successfully killed the crown for ${bold(artist)}`)
      );
    }
  }
}
