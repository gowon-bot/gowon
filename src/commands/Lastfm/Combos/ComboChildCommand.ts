import { formatDistance } from "date-fns";
import { Combo } from "../../../database/entity/Combo";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import {
  displayAlbumLink,
  displayArtistLink,
  displayDate,
  displayNumber,
  displayTrackLink,
} from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ComboService } from "../../../services/dbservices/ComboService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export abstract class ComboChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  parentName = "combo";
  subcategory = "stats";

  comboService = ServiceRegistry.get(ComboService);

  protected displayCombo(combo: Combo): string {
    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      `${displayDate(combo.firstScrobble)} (lasted ${formatDistance(
        combo.firstScrobble,
        combo.lastScrobble
      )})`,
      {
        shouldDisplay: (combo.artistPlays || 0) > 1,
        string: `Artist: ${displayNumber(
          combo.artistPlays!
        )} (${displayArtistLink(combo.artistName!)})`,
      },
      {
        shouldDisplay: (combo.albumPlays || 0) > 1,
        string: `Album: ${displayNumber(combo.albumPlays!)} (${displayAlbumLink(
          combo.artistName!,
          combo.albumName!
        )})`,
      },
      {
        shouldDisplay: (combo.trackPlays || 0) > 1,
        string: `Track: ${displayNumber(combo.trackPlays!)} (${displayTrackLink(
          combo.artistName!,
          combo.trackName!
        )})`,
      },
      ""
    );

    return lineConsolidator.consolidate();
  }
}
