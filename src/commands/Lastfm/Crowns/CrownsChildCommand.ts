import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { Arguments } from "../../../lib/arguments/arguments";

export abstract class CrownsChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  crownsService = new CrownsService(this.logger);
  parentName = "crowns";
  subcategory = "crowns";
}
