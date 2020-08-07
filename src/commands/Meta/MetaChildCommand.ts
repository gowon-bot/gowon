import { MetaBaseChildCommand } from "./MetaBaseCommand";
import { CommandManager } from "../../lib/command/CommandManager";

export abstract class MetaChildCommand extends MetaBaseChildCommand {
  parentName = "meta";

  commandManager = new CommandManager();
}
