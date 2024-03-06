import { NoScrobblesOfArtistError } from "../../../errors/commands/library";
import { CommandRequiresResyncError } from "../../../errors/user";
import { bold } from "../../../helpers/discord";
import { convertLilacDate } from "../../../helpers/lilac";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Variation } from "../../../lib/command/Command";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayDate } from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacLibraryService } from "../../../services/lilac/LilacLibraryService";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} satisfies ArgumentsMap;

export default class LastScrobbledArtist extends LilacBaseCommand<typeof args> {
  idSeed = "shasha wanlim";

  aliases = ["last", "lasta", "la", "lastartist"];

  variations: Variation[] = [
    { name: "first", variation: ["first", "firsta", "fa"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an artist";

  arguments = args;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
      reverseLookup: { required: true },
      syncedRequired: true,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const artistCount = await this.lilacLibraryService.getArtistCount(
      this.ctx,
      dbUser.discordID,
      artistName
    );

    if (!artistCount) {
      throw new NoScrobblesOfArtistError(perspective, artistName, "");
    } else if (!artistCount.lastScrobbled || !artistCount.firstScrobbled) {
      throw new CommandRequiresResyncError(this.prefix);
    }

    const embed = this.minimalEmbed().setDescription(
      `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${
        this.variationWasUsed("first") ? "first" : "last"
      } scrobbled ${bold(artistCount.artist.name)} on ${displayDate(
        convertLilacDate(
          this.variationWasUsed("first")
            ? artistCount.firstScrobbled
            : artistCount.lastScrobbled
        )
      )}`
    );

    await this.reply(embed);
  }
}
