import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export abstract class CrownsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  crownsService = ServiceRegistry.get(CrownsService);

  parentName = "crowns";
  subcategory = "crowns";
}
