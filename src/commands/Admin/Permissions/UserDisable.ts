import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Command, Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { CommandNotFoundError } from "../../../errors/errors";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { MessageEmbed, User } from "discord.js";
import { bold, code } from "../../../helpers/discord";
import {
  PermissionAlreadyExistsError,
  PermissionDoesNotExistError,
} from "../../../errors/permissions";

const args = {
  user: new DiscordUserArgument({
    description: "The user to ban the command for",
    required: true,
  }),
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
    required: true,
  }),
};

export class UserDisable extends PermissionsChildCommand<typeof args> {
  idSeed = "red velvet irene";

  description = "Disable or un-allow a command for a user";
  usage = ["command @user/user ID"];
  aliases = ["blacklist"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "userenable",
      variation: ["userenable", "whitelist"],
      description: "Enable or allow a command for a user",
      separateSlashCommand: true,
    },
  ];

  arguments = args;

  async run() {
    const user = this.parsedArguments.user!;
    const commandName = this.parsedArguments.command;

    const { command } = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.guildMember,
      commandID: command.id,
      entityID: `${this.requiredGuild.id}:${user.id}`,
    });

    let embed: MessageEmbed;

    if (
      !this.variationWasUsed("userenable") &&
      !this.runAs.variationWasUsed("enable")
    ) {
      embed = await this.handleDisable(command, permission, user);
    } else {
      embed = await this.handleEnable(command, permission, user);
    }

    await this.send(embed);
  }

  private async handleDisable(
    command: Command,
    permission: Permission,
    user: User
  ): Promise<MessageEmbed> {
    let deletedAllow = false;

    try {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );
    } catch (e) {
      if (e instanceof PermissionAlreadyExistsError) {
        permission.allow = true;

        await this.permissionsService.destroyPermission(
          this.ctx,
          command,
          permission
        );

        deletedAllow = true;
      }
    }

    return this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Permissions user disable"))
      .setDescription(
        `Successfully ${deletedAllow ? "un-allowed" : "disabled"} ${code(
          command.name
        )} for ${bold(user.tag)} (${user.id})`
      );
  }

  private async handleEnable(
    command: Command,
    permission: Permission,
    user: User
  ): Promise<MessageEmbed> {
    let allowed = false;

    try {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );
    } catch (e) {
      // Create allow permission
      if (e instanceof PermissionDoesNotExistError) {
        permission.allow = true;

        await this.permissionsService.createPermission(
          this.ctx,
          command,
          permission
        );

        allowed = true;
      }
    }

    return this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Permissions enable"))
      .setDescription(
        `Successfully ${allowed ? "allowed" : "re-enabled"} ${code(
          command.name
        )} for ${bold(user.tag)} (${user.id})`
      );
  }
}
