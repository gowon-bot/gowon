import { CommandGroup } from "../../lib/command/CommandGroup";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { Inventory } from "./Inventory";
import { Mint } from "./Mint";
import { View } from "./View";

export default class CardsParentCommand extends ParentCommand {
  idSeed = "ive wonyoung";

  description = "Allows you to manage your cards";
  friendlyName = "cards";

  prefixes = ["cards"];
  default = () => new Inventory();
  // customHelp = Help

  noPrefixAliases = [
    // View
    "card",
    // Mint
    "mint",
  ];

  children = new CommandGroup([Inventory, Mint, View]);
}
