import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class CrownsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  crownsService = ServiceRegistry.get(CrownsService);

  parentName = "crowns";
  subcategory = "crowns";
}
