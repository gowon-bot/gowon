import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Command } from "../../../lib/command/Command";
import { CommandNotFoundError } from "../../../errors";
import { Permission } from "../../../database/entity/Permission";
import { User as DiscordUser, Role } from "discord.js";
import { User } from "../../../database/entity/User";
import { CustomMention } from "../../../lib/arguments/mentions/CustomMention";
import { RunAs } from "../../../lib/command/RunAs";
import { asyncMap } from "../../../helpers";

const args = {
  inputs: {
    command: { index: { start: 0 } },
  },
  mentions: {
    userIDs: {
      index: { start: 0 },
      mention: new CustomMention("user:", "[0-9]{17,18}", true),
      join: false,
    },
    roleIDs: {
      index: { start: 0 },
      mention: new CustomMention("role:", "[0-9]{17,18}", true),
      join: false,
    },
  },
} as const;

export abstract class PermissionsChildCommand extends AdminBaseChildCommand<
  typeof args
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

  arguments: Arguments = args;

  async prerun() {
    this.aliases = this.parsedArguments.command!.split(/\s*\//);

    const command = await this.commandRegistry.find(
      this.aliases.join(" "),
      this.guild.id
    );

    if (!command.command && this.throwOnNoCommand) {
      throw new CommandNotFoundError();
    }

    if (command.command) this.command = command.command;
    this.commandRunAs = command.runAs;
    let userIDs = this.parsedArguments.userIDs || [];
    let roleIDs = this.parsedArguments.roleIDs || [];

    const { users: userMentions, roles: roleMentions } = this.message.mentions;

    const users = Array.from(userMentions.values());
    const roles = Array.from(roleMentions.values());

    for (const role of await asyncMap(roleIDs, (id) =>
      Permission.toDiscordRole(this.message, id)
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
