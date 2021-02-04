import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
import { AdminService } from "../../services/dbservices/AdminService";

export abstract class AdminBaseCommand extends BaseCommand {
  category = "admin";

  adminService = new AdminService(this.gowonClient);
}

export abstract class AdminBaseParentCommand extends ParentCommand {
  category = "admin";
}

export abstract class AdminBaseChildCommand<
  T extends Arguments = Arguments
> extends ChildCommand<T> {
  category = "admin";

  adminService = new AdminService(this.gowonClient);
}
