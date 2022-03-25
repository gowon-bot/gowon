import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Command } from "../../lib/command/Command";
import {
  ParentCommand,
  BaseChildCommand,
} from "../../lib/command/ParentCommand";
import { AdminService } from "../../services/dbservices/AdminService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export abstract class AdminBaseCommand extends Command {
  category = "admin";

  adminService = ServiceRegistry.get(AdminService);
}

export abstract class AdminBaseParentCommand extends ParentCommand {
  category = "admin";
}

export abstract class AdminBaseChildCommand<
  T extends ArgumentsMap
> extends BaseChildCommand<T> {
  category = "admin";

  adminService = ServiceRegistry.get(AdminService);
}
