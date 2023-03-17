import { BaseChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { FishyService } from "../../services/fishy/FishyService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export abstract class FishyChildCommand<
  T extends ArgumentsMap = ArgumentsMap
> extends BaseChildCommand<T> {
  parentName = "fishy";
  category = "fishy";

  fishyService = ServiceRegistry.get(FishyService);
}
