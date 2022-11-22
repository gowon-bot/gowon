import { italic } from "../../../helpers/discord";
import { extraWideSpace } from "../../../helpers/specialCharacters";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Emoji } from "../../../lib/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LilacArtistCountsPage } from "../../../services/lilac/LilacAPIService.types";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  artist: new StringArgument({
    index: { start: 0 },
    description: "The artist to see tags for",
  }),
  ...standardMentions,
} as const;

export default class ArtistTags extends LastFMBaseCommand<typeof args> {
  idSeed = "le sserafim sakura";

  description =
    "Shows the top tags for an artist, and your top artists for each tag";
  subcategory = "tags";
  aliases = ["tags", "atags"];
  usage = ["artist", ""];

  arguments = args;

  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

  async run() {
    const { requestable, dbUser } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const artist = await this.lastFMArguments.getArtist(this.ctx, requestable);

    const artistInfo = await this.lastFMService.artistInfo(this.ctx, {
      artist,
    });

    if (artistInfo.tags.length == 0) {
      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Artist tags"))
        .setDescription(`Couldn't find any tags for ${artistInfo.name}`);

      await this.send(embed);
      return;
    }

    const artistCountPages =
      await this.lilacArtistsService.getArtistCountsForTags(
        this.ctx,
        {
          discordID: dbUser.discordID,
        },
        artistInfo.tags
      );

    const lineConsolidator = new LineConsolidator().addLines(
      ...artistCountPages
        .sort((p1, p2) => p1.pagination.totalItems - p2.pagination.totalItems)
        .map((page, idx) => ({
          shouldDisplay: true,
          string: {
            title: artistInfo.tags[idx].toLowerCase(),
            value:
              "\n" +
              (page.pagination.totalItems > 0
                ? this.generateArtistList(page)
                : italic("(no artists)")) +
              "\n",
          },
        }))
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Artist tags"))
      .setTitle(
        `${Emoji.usesIndexedDataLink} Artist tags for ${artistInfo.name}`
      )
      .setURL(artistInfo.url)
      .setDescription(lineConsolidator.consolidate());

    await this.send(embed);
  }

  private generateArtistList(page: LilacArtistCountsPage): string {
    return displayNumberedList(
      page.artistCounts.map(
        (ac) => `${ac.artist.name} - ${displayNumber(ac.playcount, "play")}`
      ),
      0,
      1,
      extraWideSpace
    );
  }
}
