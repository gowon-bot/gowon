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
  private cache: { [key: PermissionCacheKey]: boolean } = {};

  get(key: PermissionCacheKey): Permission | undefined {
    const allow = this.cache[key];

    if (allow !== undefined) {
      return this.buildPermission(key, allow);
    }

    return undefined;
  }

  set(key: PermissionCacheKey, allow: boolean) {
    this.cache[key] = allow;
  }

  private buildPermission(key: PermissionCacheKey, value: boolean): Permission {
    const [_, type, commandID, entityID] = key.split("-");

    return Permission.create({
      commandID: commandID,
      entityID: entityID,
      type: type as PermissionType,
      allow: value,
    });
  }
}
