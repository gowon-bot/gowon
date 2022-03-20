import { CrownsChildCommand } from "./CrownsChildCommand";
import { LogicError } from "../../../errors/errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { bold } from "../../../helpers/discord";

const args = {
  ...prefabArguments.requiredArtist,
} as const;

export class Kill extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn xuanyi";

  description = "Kills a crown";
  usage = ["artist (case sensitive!)"];

  adminCommand = true;

  arguments = args;

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    const artist = this.parsedArguments.artist;

    const crown = await this.crownsService.getCrown(this.ctx, artist, {
      noRedirect: true,
      caseSensitive: true,
    });

    if (!crown) {
      throw new LogicError(
        `A crown for ${bold(
          artist
        )} doesn't exist! *Make sure the artist exactly matches the artist name on the crown!*`
      );
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
