import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";
import { Info } from "./Info";
import { List } from "./List";
import { DM } from "./DM";
import { CheckMany } from "./CheckMultiple";
import { TopCrowns } from "./TopCrowns";
import { ContentiousCrowns } from "./ContentiousCrowns";
import { TopCrownHolders } from "./TopCrownHolders";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  prefixes = ["crowns ", "cw "];
  default = () => new List();
  canSkipPrefixFor = ["info", "check", "checkmany"];

  children = new CommandManager({
    check: () => new Check(),
    info: () => new Info(),
    list: () => new List(),
    checkmany: () => new CheckMany(),
    topcrowns: () => new TopCrowns(),
    contentiouscrowns: () => new ContentiousCrowns(),
    topcrownholders: () => new TopCrownHolders(),
    dm: () => new DM(),
  });
}
