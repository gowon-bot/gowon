import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";
import { Info } from "./Info";
import { List } from "./List";
import { DM } from "./DM";
import { CheckMany } from "./CheckMany";
import { TopCrowns } from "./TopCrowns";
import { ContentiousCrowns } from "./ContentiousCrowns";
import { TopCrownHolders } from "./TopCrownHolders";
import { SetInactiveRole } from "./SetInactiveRole";
import { OptOut } from "./OptOut";
import { OptIn } from "./OptIn";
import { Rank } from "./Rank";
import { Kill } from "./Kill";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  friendlyName = "crowns";

  prefixes = ["crowns", "cw"];
  default = () => new List();
  canSkipPrefixFor = ["info", "check", "checkmany"];

  children: CommandManager = new CommandManager({
    check: () => new Check(),
    info: () => new Info(),
    list: () => new List(),
    checkmany: () => new CheckMany(),
    topcrowns: () => new TopCrowns(),
    contentiouscrowns: () => new ContentiousCrowns(),
    topcrownholders: () => new TopCrownHolders(),
    dm: () => new DM(),
    setinactiverole: () => new SetInactiveRole(),
    optout: () => new OptOut(),
    optin: () => new OptIn(),
    rank: () => new Rank(),
    kill: () => new Kill(),
  });
}
