import { NoScrobblesOfAlbumError } from "../../../errors/commands/library";
import { CommandRequiresResyncError } from "../../../errors/user";
import { bold, italic } from "../../../helpers/discord";
import { convertLilacDate } from "../../../helpers/lilac";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Variation } from "../../../lib/command/Command";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayDate } from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacLibraryService } from "../../../services/lilac/LilacLibraryService";

const args = {
  ...standardMentions,
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export default class LastScrobbledAlbum extends LilacBaseCommand<typeof args> {
  idSeed = "shasha chaki";

  aliases = ["lastl", "lal", "lastalbum"];
  variations: Variation[] = [
    { name: "first", variation: ["firstl", "fl", "fal", "firstalbum"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled an album";

  arguments = args;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
      reverseLookup: { required: true },
      syncedRequired: true,
    });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, {
        redirect: true,
      });

    const albumCount = await this.lilacLibraryService.getAlbumCount(
      this.ctx,
      dbUser.discordID,
      artistName,
      albumName
    );

    if (!albumCount) {
      throw new NoScrobblesOfAlbumError(perspective, artistName, albumName);
    } else if (!albumCount.lastScrobbled || !albumCount.firstScrobbled) {
      throw new CommandRequiresResyncError(this.prefix);
    }

    const embed = this.minimalEmbed().setDescription(
      `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${
        this.variationWasUsed("first") ? "first" : "last"
      } scrobbled ${italic(albumCount.album.name)} by ${bold(
        albumCount.album.artist.name
      )} on ${displayDate(
        convertLilacDate(
          this.variationWasUsed("first")
            ? albumCount.firstScrobbled
            : albumCount.lastScrobbled
        )
      )}`
    );

    await this.reply(embed);
  }
}
