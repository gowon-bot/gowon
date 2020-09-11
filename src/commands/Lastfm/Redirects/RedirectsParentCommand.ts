import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Add } from "./Add";
import { List } from "./List";

export default class RedirectsParentCommand extends LastFMBaseParentCommand {
  friendlyName = "redirects";
  subcategory = "redirects";

  prefixes = ["redirects", "redirect", "re"];
  default = () => new List();

  children: CommandManager = new CommandManager({
    add: () => new Add(),
    list: () => new List(),
  });
}
