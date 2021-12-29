import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { sanitizeForDiscord } from "../../../helpers/discord";

const args = {
  inputs: {
    artist: {
      index: 0,
      splitOn: "|",
    },
    album: {
      index: 1,
      splitOn: "|",
    },
  },
  mentions: standardMentions,
} as const;

export default class AlbumAround extends LastFMBaseCommand<typeof args> {
  idSeed = "wonder girls sunmi";

  aliases = ["laround", "alaround", "alar"];
  description = "Shows the ranks around an album in your top 1000 albums";
  subcategory = "ranks";
  usage = ["", "artist | album @user"];

  arguments: Arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable,
      true
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
        `That album wasn't found in ${
          perspective.possessive
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
            const display = `${val.name.italic()} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return start + idx === rank ? display.strong(false) : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
