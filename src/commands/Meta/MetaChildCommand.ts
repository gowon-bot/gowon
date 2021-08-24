import { MetaBaseChildCommand } from "./MetaBaseCommand";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { Arguments } from "../../lib/arguments/arguments";

export abstract class MetaChildCommand<
  T extends Arguments = Arguments
> extends MetaBaseChildCommand<T> {
  parentName = "meta";
  subcategory = "meta";
  devCommand = true;

  commandRegistry = new CommandRegistry();
}
