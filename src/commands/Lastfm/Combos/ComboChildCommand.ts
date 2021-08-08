import { Arguments } from "../../../lib/arguments/arguments";
import { ComboService } from "../../../services/dbservices/ComboService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export abstract class ComboChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  parentName = "combo";
  subcategory = "stats";

  comboService = new ComboService(this.logger);
}
