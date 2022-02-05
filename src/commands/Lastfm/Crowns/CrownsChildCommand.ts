import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { Arguments } from "../../../lib/arguments/arguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export abstract class CrownsChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  crownsService = ServiceRegistry.get(CrownsService);

  ctx = this.generateContext({
    constants: { crownsService: this.crownsService },
    mutable: {},
  });

  parentName = "crowns";
  subcategory = "crowns";
}
