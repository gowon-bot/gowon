import { Permission, PermissionType } from "../database/entity/Permission";
import { CanCheck } from "../lib/permissions/PermissionsService";

export function generateCanCheckMessage(canCheck: CanCheck): string {
  if (canCheck.permission && canCheck.permission instanceof Permission) {
    switch (canCheck.permission.type) {
      case PermissionType.user:
        return "You have been banned from using that command by the developer!";
      case PermissionType.channel:
        return "That command cannot be run in this channel!";
      case PermissionType.guild:
        return "That command has been disabled in this server!";
      case PermissionType.bot:
        return "That command has been disabled bot-wide!";
    }
  } else if (typeof canCheck.permission === "string") {
    switch (canCheck.permission) {
      case "admin":
        return "Only server administrators can run that command!";
      case "developer":
        return "Only the developer can run that command!";
    }
  }

  return "You are not allowed to run that command!";
}
