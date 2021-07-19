import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Paginator } from "../../../lib/Paginator";
import {
  TagComboCalculator,
  TagCombo as TagComboType,
} from "../../../lib/calculators/TagComboCalculator";
import { TagsService } from "../../../services/dbservices/tags/TagsService";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
} as const;

export default class TagCombo extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number dita";

  aliases = ["tagstreak", "tac", "tagscombo", "combotags"];
  description = `Shows your current streak\n Max combo: ${displayNumber(
    this.gowonService.constants.hardPageLimit * 1000
  )}`;
  subcategory = "library stats";
  usage = [""];

  arguments: Arguments = args;

  tagsService = new TagsService(this.logger);

  showLoadingAfter = this.gowonService.constants.defaultLoadingTime;

  async run() {
    const { requestable, username } = await this.parseMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.constants.hardPageLimit,
      { username: requestable, limit: 1000 }
    );

    const comboCalculator = new TagComboCalculator(this.tagsService);

    const combo = await comboCalculator.calculate(paginator);

    const sorted = Object.keys(combo.comboCollection)
      .filter((t) => combo.comboCollection[t].plays > 0)
      .sort((a, b) => b.length - a.length)
      .sort(
        (a, b) =>
          combo.comboCollection[b].plays - combo.comboCollection[a].plays
      );

    const embed = this.newEmbed()
      .setTitle(
        `Streak for ${username} (from recent ${displayNumber(
          comboCalculator.totalTracks,
          "track"
        )})`
      )
      .setDescription(
        combo.hasAnyConsecutivePlays()
          ? sorted.map((t) => this.displayCombo(combo, t))
          : "No consecutive plays found!"
      );

    await this.send(embed);
  }

  private displayCombo(combo: TagComboType, tag: string): string {
    return `${tag.strong()}: ${displayNumber(
      combo.comboCollection[tag].plays
    )}${
      combo.comboCollection[tag].hitMax
        ? "+"
        : combo.comboCollection[tag].nowplaying
        ? "➚"
        : ""
    } in a row`;
  }
}
