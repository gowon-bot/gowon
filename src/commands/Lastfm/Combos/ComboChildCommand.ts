import { Arguments } from "../../../lib/arguments/arguments";
import { ComboService } from "../../../services/dbservices/ComboService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { Combo } from "../../../database/entity/Combo";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { formatDistance } from "date-fns";
import {
  displayDate,
  displayLink,
  displayNumber,
} from "../../../lib/views/displays";
import { LinkGenerator } from "../../../helpers/lastFM";

export abstract class ComboChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  parentName = "combo";
  subcategory = "stats";

  comboService = new ComboService(this.logger);

  protected displayCombo(combo: Combo): string {
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
