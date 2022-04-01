import { BaseChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { CardsService } from "../../services/dbservices/CardsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export abstract class CardsChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  parentName = "cards";
  category = "cards";

  cardsService = ServiceRegistry.get(CardsService);
  secretCommand = true;
}
