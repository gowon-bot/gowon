import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  inputs: {
    artist: {
      index: { start: 0 },
    },
  },
  mentions: standardMentions,
} as const;

export default class ArtistAround extends LastFMBaseCommand<typeof args> {
  idSeed = "hot issue dain";

  aliases = ["around", "aar"];
  description = "Shows the ranks around an artist in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments: Arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);
  redirectsCache = new RedirectsCache(this.redirectsService);

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      true
    );

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    await this.redirectsCache.initialCache(
      this.ctx,
      topArtists.artists.map((a) => a.name)
    );

    const rank = (
      await Promise.all(
        topArtists.artists.map(
          async (a) => await this.redirectsCache.getRedirect(a.name)
        )
      )
    ).findIndex((a) => a.toLowerCase() === artistName.toLowerCase());

    if (rank === -1) {
      throw new LogicError(
        `That artist wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topArtists.artists.length, "artist")}`
      );
    }

    const start = rank < 5 ? 0 : rank - 5;
    const stop =
      rank > topArtists.artists.length - 6
        ? topArtists.artists.length - 1
        : rank + 6;

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Artist around"))
      .setTitle(
        `Artists around ${topArtists.artists[rank].name} in ${perspective.possessive} library`
      )
      .setDescription(
        displayNumberedList(
          topArtists.artists.slice(start, stop).map((val, idx) => {
            const display = `${val.name} - ${displayNumber(
              val.userPlaycount,
              "play"
            )}`;

            return start + idx === rank ? display.strong() : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
