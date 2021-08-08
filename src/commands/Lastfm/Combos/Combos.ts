import { Arguments } from "../../../lib/arguments/arguments";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";
import { ComboChildCommand } from "./ComboChildCommand";
import { LogicError } from "../../../errors";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import {
  displayDate,
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Combo } from "../../../database/entity/Combo";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { formatDistance } from "date-fns";

const args = {
  mentions: standardMentions,
} as const;

export class Combos extends ComboChildCommand<typeof args> {
  idSeed = "wonder girls yeeun";

  aliases = ["streaks"];
  description = "Shows your largest combos";
  subcategory = "library stats";
  usage = [""];

  arguments: Arguments = args;

  redirectsService = new RedirectsService(this.logger);
  artistsService = new ArtistsService(this.logger);

  async run() {
    const { perspective, dbUser } = await this.parseMentions();

    const combos = await this.comboService.listCombos(dbUser);

    if (!combos.length) {
      throw new LogicError(
        `You don't have any combos saved yet! \`${this.prefix}combo\` saves your combo`
      );
    }

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor(
        `${perspective.upper.possessive.replace(/`/g, "")} top combos`
      )
    );

    const displayCombo = this.displayCombo.bind(this);

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: combos,
        pageSize: 5,
        pageRenderer(combos, { offset }) {
          return displayNumberedList(combos.map(displayCombo), offset);
        },
      },
      { itemName: "combo" }
    );

    scrollingEmbed.send();
  }

  private displayCombo(combo: Combo): string {
    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      `${displayDate(combo.firstScrobble)} (lasted ${formatDistance(
        combo.firstScrobble,
        combo.lastScrobble
      )})`,
      {
        shouldDisplay: (combo.artistPlays || 0) > 1,
        string: `Artist: ${displayNumber(combo.artistPlays!)} (${displayLink(
          combo.artistName!,
          LinkGenerator.artistPage(combo.artistName!)
        )})`,
      },
      {
        shouldDisplay: (combo.albumPlays || 0) > 1,
        string: `Album: ${displayNumber(combo.albumPlays!)} (${displayLink(
          combo.albumName!,
          LinkGenerator.albumPage(combo.artistName!, combo.albumName!)
        )})`,
      },
      {
        shouldDisplay: (combo.trackPlays || 0) > 1,
        string: `Track: ${displayNumber(combo.trackPlays!)} (${displayLink(
          combo.trackName!,
          LinkGenerator.trackPage(combo.artistName!, combo.trackName!)
        )})`,
      },
      ""
    );

    return lineConsolidator.consolidate();
  }
}
