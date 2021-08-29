import { CommandRegistry } from "../../../lib/command/CommandRegistry";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Current } from "./Current";
import { Combos } from "./Combos";
import { ServerCombos } from "./Server";

export default class ComboParentCommand extends LastFMBaseParentCommand {
  idSeed = "hello venus lime";

  subcategory = "stats";
  description = "Allows you to view and manage your combos";
  friendlyName = "combo";
  // customHelp = Help;

  noPrefixAliases = [
    // Combos
    "combos",
    "cbs",
    // Server combos
    "servercombos",
    "scbs",
  ];

  prefixes = ["combo", "streak", "cb"];
  default = () => new Current();

  children = new CommandRegistry({
    view: () => new Current(),
    combos: () => new Combos(),
    server: () => new ServerCombos(),
  });
}
