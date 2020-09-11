import { CommandManager } from "../../lib/command/CommandManager";
import Feedback from "./Feedback";
import { MetaBaseParentCommand } from "./MetaBaseCommand";
import { TopCommands } from "./TopCommands";

export default class MetaParentCommamnd extends MetaBaseParentCommand {
  friendlyName = "meta";

  prefixes = ["meta"];

  children: CommandManager = new CommandManager({
    topcommands: () => new TopCommands(),
    feedback: () => new Feedback(),
  });
}
