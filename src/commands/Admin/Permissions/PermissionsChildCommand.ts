import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { PermissionsService } from "../../../lib/permissions/PermissionsService";

export abstract class PermissionsChildCommand<
  T extends ArgumentsMap = {}
> extends AdminBaseChildCommand<T> {
  parentName = "permissions";
  subcategory = "permissions";

  adminCommand = true;

  permissionsService = ServiceRegistry.get(PermissionsService);
}
