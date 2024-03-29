import { CommandPermission } from "./permissions";

export interface CommandAccessRole {
  readonly friendlyName: string;
  readonly name: string;
  permissions: readonly CommandPermission[];
  extends?: readonly CommandAccessRoleName[];
}

export const roles = {
  developer: {
    friendlyName: "Developer",
    name: "developer",
    permissions: [],
    extends: ["contentmoderator", "betatester"],
  },
  contentmoderator: {
    friendlyName: "Content moderator",
    name: "contentmoderator",
    permissions: [] as readonly CommandPermission[],
  },
  alphatester: {
    friendlyName: "Alpha tester",
    name: "alphatester",
    permissions: [] as readonly CommandPermission[],
    extends: ["betatester"],
  },
  betatester: {
    friendlyName: "Beta tester",
    name: "betatester",
    permissions: [] as readonly CommandPermission[],
  },
  "#swag": {
    friendlyName: "#swag",
    name: "#swag",
    permissions: [] as readonly CommandPermission[],
  },
};

export type CommandAccessRoleName = keyof typeof roles;

export function getRoles(name: CommandAccessRoleName): CommandAccessRole[] {
  const mainRole = roles[name] as CommandAccessRole;
  const extendingRoles: any = mainRole.extends?.map((r) => roles[r]) || [];

  return [mainRole, ...extendingRoles];
}
