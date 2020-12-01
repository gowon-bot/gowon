import { CommandManager } from "../../../lib/command/CommandManager";
import { AdminBaseParentCommand } from "../AdminBaseCommand";
import { Blacklist } from "./Blacklist";
import { Help } from "./Help";
import { Delist } from "./Delist";
import { View } from "./View";
import { Enable } from "./Enable";
import { Disable } from "./Disable";
import { Disabled } from "./Disabled";
import { ChannelBlacklist } from "./ChannelBlacklist";

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  description = "Manage permissions for Gowon in your guild\nSee permissions help for more info"

  friendlyName = "permissions";

  prefixes = ["permissions", "perms"];

  children: CommandManager = new CommandManager({
    blacklist: () => new Blacklist(),
    help: () => new Help(),
    delist: () => new Delist(),
    list: () => new View(),
    enable: () => new Enable(),
    disable: () => new Disable(),
    disabled: () => new Disabled(),
    channelblacklist: () => new ChannelBlacklist(),
  });
}
