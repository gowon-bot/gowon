import { bold } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { EmbedView } from "../../../lib/ui/views/EmbedView";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...prefabArguments.requiredArtist,
} satisfies ArgumentsMap;

export class BanArtist extends CrownsChildCommand<typeof args> {
  idSeed = "loona olivia hye";
  description = "Bans an artist from the crowns game";
  usage = "artist";

  arguments = args;

  adminCommand = true;

  variations: Variation[] = [
    {
      name: "unban",
      variation: "unbanartist",
      description: "Unbans an artist from the crowns game",
    },
  ];

  async run() {
    const artist = this.parsedArguments.artist;

    const unban = this.variationWasUsed("unban");

    if (unban) {
      const artistCrownBan = await this.crownsService.artistCrownUnban(
        this.ctx,
        artist
      );

      await this.reply(this.makeEmbed(artistCrownBan.artistName, unban));
    } else {
      const artistCrownBan = await this.crownsService.artistCrownBan(
        this.ctx,
        artist
      );

      await this.crownsService.killCrown(this.ctx, artistCrownBan.artistName);

      await this.reply(this.makeEmbed(artistCrownBan.artistName, unban));
    }
  }

  private makeEmbed(artistName: string, unban: boolean): EmbedView {
    const embed = new SuccessEmbed().setDescription(
      `Successfully ${unban ? "un" : ""}banned the artist ${bold(
        artistName
      )} from the crowns game.`
    );

    return embed;
  }
}
