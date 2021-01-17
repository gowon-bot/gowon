import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Paginator } from "../../../lib/Paginator";
import {
  TagComboCalculator,
  TagCombo as TagComboType,
} from "../../../lib/calculators/TagComboCalculator";
import { TagsService } from "../../../services/dbservices/TagsService";

export default class TagCombo extends LastFMBaseCommand {
  idSeed = "secret number dita";

  aliases = ["tagstreak", "tac"];
  description = `Shows your current streak\n Max combo: ${numberDisplay(
    this.gowonService.constants.hardPageLimit * 1000
  )}`;
  subcategory = "library stats";
  usage = [""];

  arguments: Arguments = {
    mentions: standardMentions,
  };

  tagsService = new TagsService(this.logger);

  showLoadingAfter = this.gowonService.constants.defaultLoadingTime;

  async run() {
    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.constants.hardPageLimit,
      { username, limit: 1000 }
    );

    let comboCalculator = new TagComboCalculator(
      this.tagsService,
      this.lastFMService
    );

    let combo = await comboCalculator.calculate(paginator);

    const sorted = Object.keys(combo.comboCollection)
      .filter((t) => combo.comboCollection[t].plays > 0)
      .sort((a, b) => b.length - a.length)
      .sort(
        (a, b) =>
          combo.comboCollection[b].plays - combo.comboCollection[a].plays
      );

    let embed = this.newEmbed()
      .setTitle(
        `Streak for ${username} (from recent ${numberDisplay(
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
    return `${tag.strong()}: ${numberDisplay(
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
