import { PermissionsChildCommand } from "../../Admin/Permissions/PermissionsChildCommand";

export class Enable extends PermissionsChildCommand {
  idSeed = "loona heejin";
  description = "Re-enable a command";
  usage = "command";

  archived = true;

  async run() {}
}
