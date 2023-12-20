import { bold } from "../../../helpers/discord";
import {
  TagComboCalculator,
  TagCombo as TagComboType,
} from "../../../lib/calculators/TagComboCalculator";
import { constants } from "../../../lib/constants";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TagCombo extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number dita";

  aliases = [
    "tagstreak",
    "tac",
    "tagscombo",
    "combotags",
    "genrecombo",
    "genrestreak",
  ];
  description = `Shows your current streak\n Max combo: ${displayNumber(
    constants.hardPageLimit * 1000
  )}`;
  subcategory = "library stats";
  usage = [""];

  arguments = args;

  showLoadingAfter = constants.defaultLoadingTime;

  async run() {
    const { requestable, username } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      constants.hardPageLimit,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const comboCalculator = new TagComboCalculator(this.ctx);

    const combo = await comboCalculator.calculate(paginator);

    const sorted = Object.keys(combo.comboCollection)
      .filter((t) => combo.comboCollection[t].plays > 0)
      .sort((a, b) => b.length - a.length)
      .sort(
        (a, b) =>
          combo.comboCollection[b].plays - combo.comboCollection[a].plays
      );

    const embed = this.authorEmbed()
      .setHeader("Tag combo")
      .setTitle(
        `Streak for ${username} (from recent ${displayNumber(
          comboCalculator.totalTracks,
          "track"
        )})`
      )
      .setDescription(
        combo.hasAnyConsecutivePlays()
          ? sorted.map((t) => this.displayCombo(combo, t)).join("\n")
          : "No consecutive plays found!"
      );

    await this.send(embed);
  }

  private displayCombo(combo: TagComboType, tag: string): string {
    return `${bold(tag)}: ${displayNumber(combo.comboCollection[tag].plays)}${
      combo.comboCollection[tag].hitMax
        ? "+"
        : combo.comboCollection[tag].nowplaying
        ? "➚"
        : ""
    } in a row`;
  }
}
