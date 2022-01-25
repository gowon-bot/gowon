import { CommandGroup } from "../../../lib/command/CommandGroup";
import { AdminBaseParentCommand } from "../AdminBaseCommand";
import { Blacklist } from "./Blacklist";
import { Help } from "./Help";
import { Delist } from "./Delist";
import { View } from "./View";
import { Enable } from "./Enable";
import { Disable } from "./Disable";
import { Disabled } from "./Disabled";
import { ChannelBlacklist } from "./ChannelBlacklist";
import { SetAdminRole } from "./SetAdminRole";

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  idSeed = "loona vivi";

  adminCommand = true;

  description =
    "Manage permissions for Gowon in your guild\nSee permissions help for more info";
  friendlyName = "permissions";
  prefixes = ["permissions", "perms"];

  default = () => new Help();
  customHelp = Help;

  noPrefixAliases = [
    // Enable
    "enable",
    // Disable
    "disable",
    // SetAdminRole,
    "setadminrole",
  ];

  children: CommandGroup = new CommandGroup([
    Blacklist,
    ChannelBlacklist,
    Delist,
    Disable,
    Disabled,
    Enable,
    Help,
    SetAdminRole,
    View,
  ]);
}
