import { CommandManager } from "../../lib/command/CommandManager";
import Issue from "./Issue";
import { MetaBaseParentCommand } from "./MetaBaseCommand";
import { TopCommands } from "./TopCommands";
import { ServerReport } from "./ServerReport";

export default class MetaParentCommamnd extends MetaBaseParentCommand {
  idSeed = "apink namjoo";

  friendlyName = "meta";
  prefixes = ["meta"];
  devCommand = true;

  children: CommandManager = new CommandManager({
    topcommands: () => new TopCommands(),
    feedback: () => new Issue(),
    serverreport: () => new ServerReport(),
  });
}
