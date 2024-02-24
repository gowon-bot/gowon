import { PermissionsChildCommand } from "../../Admin/Permissions/PermissionsChildCommand";

export class Delist extends PermissionsChildCommand {
  idSeed = "red velvet joy";

  archived = true;

  description = "Remove a user/role from a white/blacklist";
  usage = ["command @role or role:roleid", "command @user or user:userid"];

  aliases = ["dewhitelist", "deblacklist", "unwhitelist", "unblacklist"];

  async run() {}
}
