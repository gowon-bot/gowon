import { Role, GuildMember, MessageReaction, User } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { Permission } from "../database/entity/Permission";
import { GowonContext } from "../lib/context/Context";

export function sanitizeForDiscord(string: string): string {
  const characters = ["||", "*", "_", "`"];

  for (let character of characters) {
    string = string.replace(
      new RegExp(escapeStringRegexp(character), "g"),
      (match) => `\\${match}`
    );
  }

  return string.replace(/\n/g, " ");
}

export interface NamedPermission extends Permission {
  name: string;
}
export async function addNamesToPermissions(
  ctx: GowonContext,
  _permissions: Permission[]
): Promise<NamedPermission[]> {
  let namedPermissions = [] as NamedPermission[];

  let permissions = <NamedPermission[]>_permissions;

  for (let permission of permissions) {
    let entity = await (permission.isRoleBased
      ? permission.toDiscordRole(ctx)
      : permission.toDiscordUser(ctx.guild!));

    permission.name = entity instanceof Role ? entity.name : entity.username;

    namedPermissions.push(permission);
  }

  return namedPermissions;
}

export function userHasRole(
  member: GuildMember | undefined,
  roleID: string | undefined
): boolean {
  if (!roleID || !member) {
    return false;
  }

  return member.roles.cache.has(roleID);
}

export function cleanURL(url: string): string {
  return url
    .replace(/\)/g, "%29")
    .replace(/\(/g, "%28")
    .replace(/,/g, "%2C")
    .replace(/_/g, "%5f");
}

export type ReactionCollectorFilter = (
  reaction: MessageReaction,
  user: User
) => boolean;
