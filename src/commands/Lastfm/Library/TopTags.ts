import { generateHumanPeriod, generatePeriod } from "../../../helpers/date";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { TagsService } from "../../../services/dbservices/tags/TagsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    timePeriod: {
      custom: (messageString: string) => generatePeriod(messageString, "7day"),
      index: -1,
    },
    humanReadableTimePeriod: {
      custom: (messageString: string) =>
        generateHumanPeriod(messageString, "7day"),
      index: -1,
    },
  },
  mentions: standardMentions,
} as const;

export default class TopTags extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn soso";

  subcategory = "tags";
  description = "Displays your top tags";
  aliases = [];

  arguments: Arguments = args;

  tagsService = new TagsService(this.lastFMService, this.logger);

  showLoadingAfter = this.gowonService.constants.defaultLoadingTime;

  async run() {
    const { requestable, perspective } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username: requestable,
      limit: 1000,
      period: this.parsedArguments.timePeriod,
    });

    let tagsCount: { [artist: string]: number } = {};

    for (let artist of topArtists.artists) {
      let artistTags = await this.tagsService.getTags(artist.name);

      if (!artistTags) {
        artistTags = await this.lastFMService.getArtistTags(artist.name);
      }

      let tagConsolidator = new TagConsolidator().addTags(
        artistTags.map((t) => t.toLowerCase())
      );

      for (let tag of tagConsolidator.consolidate(Infinity, false)) {
        if (!tagsCount[tag]) tagsCount[tag] = 0;
        tagsCount[tag]++;
      }
    }

    let topTags = Object.keys(tagsCount).sort(
      (a, b) => tagsCount[b] - tagsCount[a]
    );

    let topTopTags = topTags.slice(0, 10);

    let embed = this.newEmbed()
      .setTitle(
        `${perspective.possessive} top tags ${this.parsedArguments.humanReadableTimePeriod}`
      )
      .setDescription(
        `_${displayNumber(topTags.length, "unique tag")}_\n` +
          topTopTags
            .map(
              (tt, idx) =>
                `${idx + 1}. ${tt} (${displayNumber(tagsCount[tt], "artist")})`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
