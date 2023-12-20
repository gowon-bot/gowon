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

export default class Month extends LastFMBaseCommand<typeof args> {
  idSeed = "exid hani";

  description =
    "Shows an overview of your month, including your top artists, albums, and tracks";
  aliases = ["monthly"];
  subcategory = "reports";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      6,
      {
        from: ~~(sub(new Date(), { months: 1 }).getTime() / 1000),
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

    paginator.maxPages = firstPage.meta.totalPages;

    const restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    const reportCalculator = new ReportCalculator(this.ctx, firstPage);

    const month = await reportCalculator.calculate();

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, month.top.tags);

    const embed = this.authorEmbed()
      .setHeader("Report month")
      .setTitle(`${perspective.upper.possessive} month`)
      .transform(ReportEmbed)
      .setDateRange(sub(new Date(), { months: 1 }), new Date())
      .setReport(month)
      .setTags(tagConsolidator);

    await this.send(embed);
  }
}
