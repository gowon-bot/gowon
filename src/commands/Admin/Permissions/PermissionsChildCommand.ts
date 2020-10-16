import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { CommandManager } from "../../../lib/command/CommandManager";
import { Command } from "../../../lib/command/Command";
import { CommandNotFoundError } from "../../../errors";
import { RunAs } from "../../../lib/AliasChecker";
import { Permission } from "../../../database/entity/Permission";
import { Message, User as DiscordUser, Role } from "discord.js";
import { User } from "../../../database/entity/User";

export abstract class PermissionsChildCommand extends AdminBaseChildCommand {
  parentName = "permissions";
  subcategory = "permissions";

  commandManager = new CommandManager();
  command!: Command;
  aliases!: string[];
  runAs!: RunAs;

  roles: Role[] = [];
  users: DiscordUser[] = [];

  throwOnNoCommand = true;

  ndmp = {
    roles: { prefix: "role:" },
    users: { prefix: "user:" },
  };

  arguments: Arguments = {
    inputs: {
      command: { index: { start: 0 } },
    },
    mentions: {
      userIDs: {
        index: { start: 0 },
        nonDiscordMentionParsing: this.ndmp.users,
        join: false,
        ndmpOnly: true,
      },
      roleIDs: {
        index: { start: 0 },
        nonDiscordMentionParsing: this.ndmp.roles,
        join: false,
        ndmpOnly: true,
      },
    },
  };

  async prerun(message: Message) {
    await this.commandManager.init();

    this.aliases = (this.parsedArguments.command as string).split(/\s*\//);

    let command = await this.commandManager.find(
      this.aliases.join(" "),
      this.guild.id
    );

    if (!command.command && this.throwOnNoCommand)
      throw new CommandNotFoundError();

    if (command.command) this.command = command.command;
    this.runAs = command.runAs;
    let userIDs = (this.parsedArguments.userIDs as string[]) || [];
    let roleIDs = (this.parsedArguments.roleIDs as string[]) || [];

    let { users: userMentions, roles: roleMentions } = message.mentions;

    let users = userMentions.array();
    let roles = roleMentions.array();

    for (let role of await Promise.all(
      roleIDs.map((id) => Permission.toDiscordRole(message, id))
    )) {
      roles.push(role!);
    }

    for (let user of await Promise.all(
      userIDs.map((id) => User.toDiscordUser(message, id)!)
    )) {
      users.push(user!);
    }

    this.users = users;
    this.roles = roles;
  }
}
