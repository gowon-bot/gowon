import { CommandGroup } from "../../lib/command/CommandGroup";
import Issue from "./Issue";
import { MetaBaseParentCommand } from "./MetaBaseCommand";
import { TopCommands } from "./TopCommands";
import { ServerReport } from "./ServerReport";

export default class MetaParentCommamnd extends MetaBaseParentCommand {
  idSeed = "apink namjoo";

  friendlyName = "meta";
  prefixes = ["meta"];
  devCommand = true;

  children: CommandGroup = new CommandGroup([TopCommands, Issue, ServerReport]);
}
