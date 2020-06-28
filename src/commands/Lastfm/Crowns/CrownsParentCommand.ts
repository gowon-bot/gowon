import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";
import { Info } from "./Info";
import { Crowns } from "./Crowns";
import { CheckAll } from "./CheckAll";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  // prefix = "crowns "

  children = new CommandManager({
    check: () => new Check(),
    info: () => new Info(),
    crowns: () => new Crowns(),
    checkall: () => new CheckAll(),
  });
}
