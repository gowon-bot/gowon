import { CommandManager } from "../../lib/command/CommandManager";
import { MetaBaseParentCommand } from "./MetaBaseCommand";
import { TopCommands } from "./TopCommands";

export default class MetaParentCommamnd extends MetaBaseParentCommand {
  friendlyName = "meta";

  prefixes = ["meta"];

  children: CommandManager = new CommandManager({
    topcommands: () => new TopCommands(),
  });
}
