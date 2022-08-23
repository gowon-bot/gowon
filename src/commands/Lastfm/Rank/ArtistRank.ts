import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors/errors";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { asyncMap } from "../../../helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { bold } from "../../../helpers/discord";

const args = {
  ...prefabArguments.artist,
  ...standardMentions,
} as const;

export default class ArtistRank extends LastFMBaseCommand<typeof args> {
  idSeed = "hot issue dain";

  aliases = ["ar", "ra", "artistaround", "around", "aar"];
  description =
    "Shows the other artists around an artist in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);
  async run() {
    const redirectsCache = new RedirectsCache(this.ctx);

    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: true }
    );

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    await redirectsCache.initialCache(
      this.ctx,
      topArtists.artists.map((a) => a.name)
    );

    const rank = (
      await asyncMap(
        topArtists.artists,
        async (a) => await redirectsCache.getRedirect(a.name)
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
      .setAuthor(this.generateEmbedAuthor("Artist around"))
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

            return start + idx === rank ? bold(display) : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
