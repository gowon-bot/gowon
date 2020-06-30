import { CommandManager } from "../../../lib/command/CommandManager";
import { AdminBaseParentCommand } from "../AdminBaseCommand";
import { Blacklist } from "./Blacklist";
import { Help } from "./Help";
import { Whitelist } from "./Whitelist";

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  prefixes = ["permissions ", "perms "];

  children = new CommandManager({
    blacklist: () => new Blacklist(),
    whitelist: () => new Whitelist(),
    help: () => new Help(),
  });
}
