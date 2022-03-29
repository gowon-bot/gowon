import { Permission, PermissionType } from "../database/entity/Permission";
import { CanCheck } from "../lib/permissions/PermissionsService";

export function generateCanCheckMessage(canCheck: CanCheck): string {
  if (canCheck.permission && canCheck.permission instanceof Permission) {
    switch (canCheck.permission.type) {
      case PermissionType.user:
        return "You have been banned from using this command by the developer!";
      case PermissionType.channel:
        return "This command cannot be run in this channel!";
      case PermissionType.guild:
        return "This command has been disabled in this server!";
      case PermissionType.bot:
        return "This command has been disabled bot-wide!";
    }
  } else if (typeof canCheck.permission === "string") {
    switch (canCheck.permission) {
      case "admin":
        return "Only server administrators can run this command!";
      case "developer":
        return "Only the developer can run this command!";
    }
  }

  return "You are not allowed to run this command!";
}
