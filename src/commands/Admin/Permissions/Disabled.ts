import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class Disabled extends PermissionsChildCommand {
  idSeed = "red velvet seulgi";

  description = "List all disabled commands";
  aliases = ["listdisabled", "disabledcommands"];
  usage = "";

  archived = true;

  async run() {}
}
