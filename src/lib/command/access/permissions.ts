import { flatDeep } from "../../../helpers";
import { CommandAccessRoleName, getRoles } from "./roles";

type PermissionNamespace = "";
type PermissionPowerLevel = "manage" | "view";

export const permissions = {} as const;

export type CommandPermission =
  `${PermissionNamespace}:${PermissionPowerLevel}:${string}`;

export function getPermissions(
  roleNames: CommandAccessRoleName[]
): CommandPermission[] {
  return Array.from(
    new Set(
      flatDeep(roleNames.map((r) => getRoles(r).map((rs) => rs.permissions)))
    )
  );
}
