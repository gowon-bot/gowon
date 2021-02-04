import { MetaBaseChildCommand } from "./MetaBaseCommand";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";

export abstract class MetaChildCommand<
  T extends Arguments = Arguments
> extends MetaBaseChildCommand<T> {
  parentName = "meta";
  subcategory = "meta";
  devCommand = true;

  commandManager = new CommandManager();
}
