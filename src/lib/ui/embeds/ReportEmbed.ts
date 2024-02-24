import { italic } from "../../../helpers/discord";
import { bullet, extraWideSpace } from "../../../helpers/specialCharacters";
import { Report, ReportCount } from "../../calculators/ReportCalculator";
import { TagConsolidator } from "../../tags/TagConsolidator";
import { displayDate, displayNumber } from "../displays";
import { EmbedView } from "../views/EmbedView";
import { View } from "../views/View";

export class ReportEmbed extends View {
  private report!: Report;
  private fromDate!: Date;
  private toDate!: Date;
  private tags!: TagConsolidator;

  constructor(private baseEmbed: EmbedView) {
    super();
  }

  asDiscordSendable(): EmbedView {
    return this.baseEmbed.setDescription(
      `
    _${displayDate(this.fromDate)} - ${displayDate(this.toDate)}_
  _${displayNumber(this.report.total.scrobbles, "scrobble")}, ${displayNumber(
        this.report.total.artists,
        "artist"
      )}, ${displayNumber(this.report.total.albums, "album")}, ${displayNumber(
        this.report.total.tracks,
        "track"
      )}_
${
  this.tags.hasAnyTags()
    ? `\n${italic(this.tags.consolidateAsStrings(10).join(", "))}\n`
    : ""
}
**Top Tracks**:
${this.displayTopEntities(this.report.top.tracks)}

**Top Albums**:
${this.displayTopEntities(this.report.top.albums)}

**Top Artists**:
${this.displayTopEntities(this.report.top.artists)}
  `
    );
  }

  setDateRange(from: Date, to: Date): this {
    this.fromDate = from;
    this.toDate = to;

    return this;
  }

  setReport(report: Report): this {
    this.report = report;
    return this;
  }

  setTags(tags: TagConsolidator): this {
    this.tags = tags;
    return this;
  }

  private displayTopEntities(topEntities: ReportCount): string {
    const topKeys = Object.keys(topEntities).sort(
      (a, b) => topEntities[b] - topEntities[a]
    );

    return (
      `${extraWideSpace}${bullet} ` +
      topKeys
        .slice(0, 3)
        .map((t) => `${t} (${displayNumber(topEntities[t], "play")})`)
        .join(`\n​${extraWideSpace}${bullet} `)
    );
  }
}
