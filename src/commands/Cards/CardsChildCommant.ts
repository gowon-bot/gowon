import { LogicError } from "../../errors/errors";
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

  async prerun() {
    if (this.guild?.id !== "955346451783897088") {
      throw new LogicError("You didn't see anything...");
    }
  }
}
