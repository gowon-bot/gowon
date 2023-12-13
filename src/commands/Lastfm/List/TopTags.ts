import { bold } from "../../../helpers/discord";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacTagsService } from "../../../services/lilac/LilacTagsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "7day",
    description: "The time period to use (defaults to week)",
  }),
  dateRange: new DateRangeArgument({
    description: "The time range to use",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TagList extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn soso";

  subcategory = "tags";
  description = "Displays your top tags";
  aliases = ["tta", "toptags"];

  slashCommand = true;
  slashCommandName = "toptags";

  arguments = args;

  lilacTagsService = ServiceRegistry.get(LilacTagsService);

  async run() {
    const timePeriod = this.parsedArguments.timePeriod;
    const dateRange = this.parsedArguments.dateRange;

    const { requestable, perspective } = await this.getMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
      period: !dateRange ? timePeriod : undefined,
      ...dateRange?.asTimeframeParams,
    });

    const artists = topArtists.artists.map((a) => ({ name: a.name }));
    const response = await this.lilacTagsService.list(this.ctx, { artists });

    const embed = this.authorEmbed()
      .setHeader("Top tags")
      .setTitle(
        `${perspective.possessive} top tags ${
          dateRange?.humanized() || humanizePeriod(timePeriod)
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

    await this.send(scrollingEmbed);
  }
}
