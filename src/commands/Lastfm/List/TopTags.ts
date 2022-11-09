import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { bold } from "../../../helpers/discord";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacTagsService } from "../../../services/lilac/LilacTagsService";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "7day",
    description: "The time period to use (defaults to week)",
  }),
  timeRange: new TimeRangeArgument({
    description: "The time range to use",
  }),
  ...standardMentions,
} as const;

export default class TagList extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn soso";

  subcategory = "tags";
  description = "Displays your top tags";
  aliases = ["tags", "tta"];

  slashCommand = true;
  slashCommandName = "toptags";

  arguments = args;

  lilacTagsService = ServiceRegistry.get(LilacTagsService);

  async run() {
    const timePeriod = this.parsedArguments.timePeriod,
      timeRange = this.parsedArguments.timeRange;

    const { requestable, perspective } = await this.getMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
      period: timePeriod,
      ...timeRange?.asTimeframeParams,
    });

    const artists = topArtists.artists.map((a) => ({ name: a.name }));
    const response = await this.lilacTagsService.list(this.ctx, { artists });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top tags"))
      .setTitle(
        `${perspective.possessive} top tags ${
          timeRange?.humanized || humanizePeriod(timePeriod)
        }`
      );

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, response.tags);

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: tagConsolidator.consolidate(),
      pageSize: 15,
      pageRenderer(tags, { offset }) {
        return displayNumberedList(
          tags.map(
            (t) =>
              `${bold(t.name)} - (${displayNumber(t.occurrences, "artist")})`
          ),
          offset
        );
      },
      overrides: { itemName: "tag" },
    });

    scrollingEmbed.send();
  }
}
