import gql from "graphql-tag";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import {
  MirrorballPageInfo,
  MirrorballTag,
} from "../../../services/mirrorball/MirrorballTypes";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument({ fallback: "7day" }),
  timeRange: new TimeRangeArgument(),
} as const;

export default class TopTags extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn soso";

  subcategory = "tags";
  description = "Displays your top tags";
  aliases = ["tags", "tta"];

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!,
      timeRange = this.parsedArguments.timeRange;

    const { requestable, perspective } = await this.parseMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
      period: timePeriod,
      ...timeRange?.asTimeframeParams,
    });

    const query = gql`
      query tags($artists: [ArtistInput!]!) {
        tags(settings: { artists: $artists }) {
          tags {
            name
            occurrences
          }
          pageInfo {
            recordCount
          }
        }
      }
    `;

    const artists = topArtists.artists.map((a) => ({ name: a.name }));

    const response = await this.mirrorballService.query<{
      tags: { tags: MirrorballTag[]; pageInfo: MirrorballPageInfo };
    }>(this.ctx, query, { artists });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top tags"))
      .setTitle(
        `${perspective.possessive} top tags ${
          timeRange?.humanized || humanizePeriod(timePeriod)
        }`
      );

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, response.tags.tags);

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: tagConsolidator.consolidate(),
        pageSize: 15,
        pageRenderer(tags, { offset }) {
          return displayNumberedList(
            tags.map(
              (t) =>
                `${t.name.strong()} - (${displayNumber(
                  t.occurrences,
                  "artist"
                )})`
            ),
            offset
          );
        },
      },
      { itemName: "tag" }
    );

    await scrollingEmbed.send();
  }
}
