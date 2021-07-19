import gql from "graphql-tag";
import { generateHumanPeriod, generatePeriod } from "../../../helpers/date";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { mirrorballClient } from "../../../lib/indexing/client";
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
  aliases = ["tags", "tta"];

  arguments: Arguments = args;

  async run() {
    const { requestable, perspective } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username: requestable,
      limit: 1000,
      period: this.parsedArguments.timePeriod,
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

    const response = await mirrorballClient.query<{
      tags: { tags: MirrorballTag[]; pageInfo: MirrorballPageInfo };
    }>({
      query,
      variables: { artists },
    });

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Top tags"))
      .setTitle(
        `${perspective.possessive} top tags ${this.parsedArguments.humanReadableTimePeriod}`
      );

    const tagConsolidator = new TagConsolidator();

    tagConsolidator.addTags(response.data.tags.tags);

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
