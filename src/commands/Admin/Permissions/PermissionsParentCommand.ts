import { CommandGroup } from "../../../lib/command/CommandGroup";
import { AdminBaseParentCommand } from "../AdminBaseCommand";
import { UserDisable } from "./UserDisable";
import { Help } from "./Help";
import { View } from "./View";
import { Disable } from "./Disable";
import { ChannelDisable } from "./ChannelDisable";
import { SetAdminRole } from "./SetAdminRole";
import { RoleDisable } from "./RoleDisable";
import { BotDisable } from "./BotDisable";
import { BotwideUserDisable } from "./BotwideUserDisable";
import { SyncGuildPermissions } from "./SyncGuildPermissions";

export default class PermissionsParentCommand extends AdminBaseParentCommand {
  idSeed = "loona vivi";

  adminCommand = true;
  slashCommand = true;

  description =
    "Manage permissions for Gowon in your guild\nSee permissions help for more info";
  friendlyName = "permissions";
  prefixes = ["permissions", "perms"];

  default = () => new Help();
  customHelp = Help;

  noPrefixAliases = [
    // Disable
    "disable",
    "enable",
    // ChannelDisable
    "channelblacklist",
    "channeldisable",
    "channelunblacklist",
    "channelenable",
    // DisableInChannel
    "userdisable",
    "blacklist",
    "userenable",
    "whitelist",
    // SetAdminRole,
    "setadminrole",
    // RoleDisable
    "roledisable",
    "roleenable",
    // BotDisable
    "botdisable",
    "botenable",
    // SyncGuildPermissions
    "syncguildpermissions",
  ];

  children: CommandGroup = new CommandGroup(
    [
      Help,
      SetAdminRole,
      View,
      // Disables
      Disable,
      BotDisable,
      BotwideUserDisable,
      ChannelDisable,
      RoleDisable,
      SyncGuildPermissions,
      UserDisable,
    ],
    this.id
  );
}
