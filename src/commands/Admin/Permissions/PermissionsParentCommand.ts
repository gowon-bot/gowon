import { CommandManager } from "../../../lib/command/CommandManager";
import { AdminBaseParentCommand } from "../AdminBaseCommand";
import { Blacklist } from "./Blacklist";
import { Help } from "./Help";
import { Delist } from "./Delist";
import { View } from "./View";

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  friendlyName = "permissions";

  prefixes = ["permissions", "perms"];

  children: CommandManager = new CommandManager({
    blacklist: () => new Blacklist(),
    help: () => new Help(),
    delist: () => new Delist(),
    list: () => new View(),
  });
}
