import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Command } from "../../../lib/command/Command";
import {
  CommandNotFoundError,
  CannotBeUsedAsASlashCommand,
} from "../../../errors/errors";
import { Permission } from "../../../database/entity/Permission";
import { User as DiscordUser, Role } from "discord.js";
import { User } from "../../../database/entity/User";
import { CustomMention } from "../../../lib/context/arguments/mentionTypes/CustomMention";
import { RunAs } from "../../../lib/command/RunAs";
import { asyncMap } from "../../../helpers";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { UserStringArgument } from "../../../lib/context/arguments/argumentTypes/UserStringArgument";

export const permissionsArgs = {
  command: new StringArgument({ index: { start: 0 } }),

  // User
  userID: new UserStringArgument({
    mention: new CustomMention("user:", "[0-9]{17,18}"),
  }),

  // Role
  roleID: new UserStringArgument({
    mention: new CustomMention("role:", "[0-9]{17,18}"),
  }),
} as const;

export abstract class PermissionsChildCommand extends AdminBaseChildCommand<
  typeof permissionsArgs
> {
  parentName = "permissions";
  subcategory = "permissions";

  adminCommand = true;

  command!: Command;
  aliases!: string[];
  commandRunAs!: RunAs;

  roles: Role[] = [];
  users: DiscordUser[] = [];

  throwOnNoCommand = true;

  arguments = permissionsArgs;

  async prerun() {
    if (this.payload.isInteraction()) {
      throw new CannotBeUsedAsASlashCommand();
    } else if (this.payload.isMessage()) {
      this.aliases = this.parsedArguments.command?.split(/\s*\//) || [];

      const command = await this.commandRegistry.find(
        this.aliases.join(" "),
        this.guild.id
      );

      if (!command.command && this.throwOnNoCommand) {
        throw new CommandNotFoundError();
      }

      if (command.command) this.command = command.command;
      this.commandRunAs = command.runAs;

      // -- Temporary, this will change with permissions rewrite
      const userIDs = this.parsedArguments.userID
        ? [this.parsedArguments.userID]
        : [];
      const roleIDs = this.parsedArguments.roleID
        ? [this.parsedArguments.roleID]
        : [];
      // --

      const { users: userMentions, roles: roleMentions } =
        this.payload.source.mentions;

      const users = Array.from(userMentions.values());
      const roles = Array.from(roleMentions.values());

      for (const role of await asyncMap(roleIDs, (id) =>
        Permission.toDiscordRole(this.ctx, id)
      )) {
        roles.push(role!);
      }

      for (const user of await asyncMap(
        userIDs,
        (id) => User.toDiscordUser(this.guild, id)!
      )) {
        users.push(user!);
      }

      this.users = users;
      this.roles = roles;
    }
  }
}
