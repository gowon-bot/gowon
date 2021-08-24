import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { CommandRegistry } from "../../../lib/command/CommandRegistry";
import { Command } from "../../../lib/command/Command";
import { CommandNotFoundError } from "../../../errors";
import { Permission } from "../../../database/entity/Permission";
import { Message, User as DiscordUser, Role } from "discord.js";
import { User } from "../../../database/entity/User";
import { CustomMention } from "../../../lib/arguments/mentions/CustomMention";
import { RunAs } from "../../../lib/command/RunAs";

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

  commandRegistry = new CommandRegistry();
  command!: Command;
  aliases!: string[];
  runAs!: RunAs;

  roles: Role[] = [];
  users: DiscordUser[] = [];

  throwOnNoCommand = true;

  arguments: Arguments = args;

  async prerun(message: Message) {
    await this.commandRegistry.init();

    this.aliases = this.parsedArguments.command!.split(/\s*\//);

    const command = await this.commandRegistry.find(
      this.aliases.join(" "),
      this.guild.id
    );

    if (!command.command && this.throwOnNoCommand) {
      throw new CommandNotFoundError();
    }

    if (command.command) this.command = command.command;
    this.runAs = command.runAs;
    let userIDs = this.parsedArguments.userIDs || [];
    let roleIDs = this.parsedArguments.roleIDs || [];

    const { users: userMentions, roles: roleMentions } = message.mentions;

    const users = Array.from(userMentions.values());
    const roles = Array.from(roleMentions.values());

    for (const role of await Promise.all(
      roleIDs.map((id) => Permission.toDiscordRole(message, id))
    )) {
      roles.push(role!);
    }

    for (let user of await Promise.all(
      userIDs.map((id) => User.toDiscordUser(this.guild, id)!)
    )) {
      users.push(user!);
    }

    this.users = users;
    this.roles = roles;
  }
}
