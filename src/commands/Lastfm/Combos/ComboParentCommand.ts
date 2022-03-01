import { CommandGroup } from "../../../lib/command/CommandGroup";
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

  slashCommand = true;

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

  children = new CommandGroup([Current, Combos, ServerCombos]);
}
