import { sub } from "date-fns";
import { LogicError } from "../../../errors/errors";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Paginator } from "../../../lib/paginators/Paginator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { ReportEmbed } from "../../../lib/ui/embeds/ReportEmbed";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export default class Day extends LastFMBaseCommand<typeof args> {
  idSeed = "bvndit seungeun";

  description =
    "Shows an overview of your day, including your top artists, albums, and tracks";
  aliases = ["daily"];
  subcategory = "reports";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { requestable, perspective, senderUser } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      4,
      {
        from: ~~(sub(new Date(), { days: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username: requestable,
        limit: 1000,
      },
      this.ctx
    );

    const firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    if (senderUser && !senderUser?.isPatron && firstPage.meta.totalPages > 4) {
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles today to see an overview!\n\nYou can become a Patron to remove the limit. See \`${this.prefix}patreon\` for more information.`
      );
    }

    paginator.maxPages = firstPage.meta.totalPages;

    const restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    const reportCalculator = new ReportCalculator(this.ctx, firstPage);

    const day = await reportCalculator.calculate();

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, day.top.tags);

    const embed = this.minimalEmbed()
      .setTitle(`${perspective.upper.possessive} day on Last.fm`)
      .transform(ReportEmbed)
      .setReport(day)
      .setDateRange(sub(new Date(), { days: 1 }), new Date())
      .setTags(tagConsolidator);

    await this.reply(embed);
  }
}
