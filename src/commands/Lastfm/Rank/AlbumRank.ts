import { LastFMBaseCommand } from "../LastFMBaseCommand";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors/errors";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap

export default class AlbumRank extends LastFMBaseCommand<typeof args> {
  idSeed = "wonder girls sunmi";

  aliases = ["lr", "alr", "albumaround", "laround", "alaround"];
  description =
    "Shows the other albums around an album in your top 1000 albums";
  subcategory = "ranks";
  usage = ["", "artist | album @user"];

  arguments = args;

  slashCommand = true;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable,
      { redirect: true }
    );

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const rank = topAlbums.albums.findIndex(
      (a) =>
        a.name.toLowerCase() === album!.toLowerCase() &&
        a.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      throw new LogicError(
        `That album wasn't found in ${perspective.possessive
        } top ${displayNumber(topAlbums.albums.length, "album")}`
      );
    }

    const start = rank < 5 ? 0 : rank - 5;
    const stop =
      rank > topAlbums.albums.length - 6
        ? topAlbums.albums.length - 1
        : rank + 6;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Album around"))
      .setTitle(
        `Albums around ${topAlbums.albums[rank].name} in ${perspective.possessive} library`
      )
      .setDescription(
        displayNumberedList(
          topAlbums.albums.slice(start, stop).map((val, idx) => {
            const display = `${italic(val.name)} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return start + idx === rank ? bold(display, false) : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
