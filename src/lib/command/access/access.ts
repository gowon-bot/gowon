import { User } from "../../../database/entity/User";
import { AccessDeniedError, CommandInBetaError } from "../../../errors";
import { flatDeep } from "../../../helpers";
import { CommandPermission, getPermissions } from "./permissions";
import { CommandAccessRole, CommandAccessRoleName, getRoles } from "./roles";

export class CommandAccess {
  private permissions?: CommandPermission[];
  private role?: CommandAccessRoleName;

  constructor(options: CommandPermission[] | CommandAccessRoleName) {
    if (options instanceof Array) {
      this.permissions = options;
    } else {
      this.role = options;
    }
  }

  public check(user: User | undefined): boolean {
    if (!user) {
      return false;
    }

    const userRoles = user.roles || [];

    if (this.role) {
      const roles = flatDeep<CommandAccessRole>(
        userRoles.map((r) => getRoles(r))
      );

      return roles.map((r) => r.name).includes(this.role);
    } else if (this.permissions) {
      const permissions = getPermissions(userRoles);

      return this.permissions.reduce<boolean>((acc, val) => {
        if (acc && !permissions.includes(val)) return false;

        return acc;
      }, true);
    }

    return false;
  }

  public checkAndThrow(user: User | undefined): void {
    if (!this.check(user)) this.throw();
  }

  protected throw() {
    throw new AccessDeniedError();
  }
}

export class BetaAccess extends CommandAccess {
  constructor() {
    super("betatester");
  }

  override throw() {
    throw new CommandInBetaError();
  }
}
