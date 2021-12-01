import gql from "graphql-tag";
import { humanizePeriod } from "../../../helpers/date";
import { Arguments } from "../../../lib/arguments/arguments";
import { TimePeriodParser } from "../../../lib/arguments/custom/TimePeriodParser";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
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

const args = {
  inputs: {
    period: { custom: new TimePeriodParser({ fallback: "7day" }) },
  },
  mentions: standardMentions,
} as const;

export default class TopTags extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn soso";

  subcategory = "tags";
  description = "Displays your top tags";
  aliases = ["tags", "tta"];

  arguments: Arguments = args;

  async run() {
    const period = this.parsedArguments.period!;

    const { requestable, perspective } = await this.parseMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
      period,
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
      .setAuthor(...this.generateEmbedAuthor("Top tags"))
      .setTitle(`${perspective.possessive} top tags ${humanizePeriod(period)}`);

    const tagConsolidator = new TagConsolidator();

    tagConsolidator.addTags(response.tags.tags);

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
