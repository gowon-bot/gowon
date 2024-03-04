import { NoScrobblesOfArtistError } from "../../../../errors/commands/library";
import { CommandRequiresSyncError } from "../../../../errors/user";
import { bold } from "../../../../helpers/discord";
import { convertLilacDate } from "../../../../helpers/lilac";
import { LilacBaseCommand } from "../../../../lib/Lilac/LilacBaseCommand";
import { Variation } from "../../../../lib/command/Command";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import { displayDate } from "../../../../lib/ui/displays";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { LilacLibraryService } from "../../../../services/lilac/LilacLibraryService";

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
      indexedRequired: true,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const response = await this.lilacLibraryService.getArtistCount(
      this.ctx,
      dbUser.discordID,
      artistName
    );

    if (!response) {
      throw new NoScrobblesOfArtistError(perspective, artistName, "");
    } else if (!response.lastScrobbled || !response.firstScrobbled) {
      throw new CommandRequiresSyncError(this.prefix);
    }

    const embed = this.minimalEmbed().setDescription(
      `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${
        this.variationWasUsed("first") ? "first" : "last"
      } scrobbled ${bold(response.artist.name)} on ${displayDate(
        convertLilacDate(
          this.variationWasUsed("first")
            ? response.firstScrobbled
            : response.lastScrobbled
        )
      )}`
    );

    await this.reply(embed);
  }
}
