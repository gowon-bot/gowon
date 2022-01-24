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

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  idSeed = "loona vivi";

  description =
    "Manage permissions for Gowon in your guild\nSee permissions help for more info";
  customHelp = Help;

  friendlyName = "permissions";

  prefixes = ["permissions", "perms"];

  default = () => new Help();

  noPrefixAliases = [
    // Enable
    "enable",
    // Disable
    "disable",
  ];

  children: CommandGroup = new CommandGroup([
    Blacklist,
    Help,
    Delist,
    View,
    Enable,
    Disable,
    Disabled,
    ChannelBlacklist,
  ]);
}
