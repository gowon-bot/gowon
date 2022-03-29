import { Permission, PermissionType } from "../../database/entity/Permission";

export type PermissionCacheKey = `permission-${PermissionType}-${string}-${
  | ""
  | string}`;

export function generateCacheKey(
  type: PermissionType,
  commandID: string,
  entityID?: string
): PermissionCacheKey {
  return `permission-${type}-${commandID}-${entityID || ""}`;
}

export class PermissionsCache {
  private cache: { [key: PermissionCacheKey]: string } = {};

  get(key: PermissionCacheKey): Permission | undefined {
    const commandID = this.cache[key];

    if (commandID) {
      return this.buildPermission(key, commandID);
    }

    return undefined;
  }

  set(key: PermissionCacheKey, commandID: string) {
    this.cache[key] = commandID;
  }

  private buildPermission(
    key: PermissionCacheKey,
    commandID: string
  ): Permission {
    const [_, type, entityID] = key.split("-");

    return Permission.create({
      commandID: commandID,
      entityID: entityID,
      type: type as PermissionType,
    });
  }
}
