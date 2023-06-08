import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { PermissionsService } from "../../../lib/permissions/PermissionsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AdminBaseChildCommand } from "../AdminBaseCommand";

export abstract class PermissionsChildCommand<
  T extends ArgumentsMap = {}
> extends AdminBaseChildCommand<T> {
  parentName = "permissions";
  subcategory = "permissions";

  adminCommand = true;
  guildRequired = true;

  permissionsService = ServiceRegistry.get(PermissionsService);
}
