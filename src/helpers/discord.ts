import { Message, Role, GuildMember, MessageReaction, User } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { Permission } from "../database/entity/Permission";

export function sanitizeForDiscord(string: string): string {
  const characters = ["||", "*", "_", "`"];

  for (let character of characters) {
    if (string.split(character).length - 1 >= 2) {
      string = string.replace(
        new RegExp(escapeStringRegexp(character), "g"),
        (match) => `\\${match}`
      );
    }
  }

  return string.replace(/\n/g, " ");
}

export interface NamedPermission extends Permission {
  name: string;
}
export async function addNamesToPermissions(
  message: Message,
  _permissions: Permission[]
): Promise<NamedPermission[]> {
  let namedPermissions = [] as NamedPermission[];

  let permissions = <NamedPermission[]>_permissions;

  for (let permission of permissions) {
    let entity = await (permission.isRoleBased
      ? permission.toDiscordRole(message)
      : permission.toDiscordUser(message.guild!));

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
  return url.replace(/\)/g, "%29").replace(/,/g, "%2C");
}

export type ReactionCollectorFilter = (
  reaction: MessageReaction,
  user: User
) => boolean;
