import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";
import { Info } from "./Info";
import { List } from "./List";
import { CheckMany } from "./CheckMultiple";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  prefix = "crowns ";
  default = () => new List();
  canSkipPrefixFor = ["info", "check", "checkmany"];

  children = new CommandManager({
    check: () => new Check(),
    info: () => new Info(),
    list: () => new List(),
    checkmany: () => new CheckMany(),
  });
}
