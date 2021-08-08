import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Current } from "./Current";
import { Combos } from "./Combos";
import { ServerCombos } from "./Server";

export default class ComboParentCommand extends LastFMBaseParentCommand {
  idSeed = "weeekly soeun";

  subcategory = "stats";
  description = "Allows you to view and manage your combos";
  friendlyName = "combo";
  // customHelp = Help;

  canSkipPrefixFor = ["combos"];

  prefixes = ["combo", "streak", "cb"];
  default = () => new Current();

  children = new CommandManager({
    view: () => new Current(),
    combos: () => new Combos(),
    server: () => new ServerCombos(),
  });
}
