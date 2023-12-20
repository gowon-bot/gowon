import { Role } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import {
  PermissionAlreadyExistsError,
  PermissionDoesNotExistError,
} from "../../../errors/commands/permissions";
import { CommandNotFoundError } from "../../../errors/errors";
import { code, mentionRole } from "../../../helpers/discord";
import { Command, Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { EmbedComponent } from "../../../lib/views/framework/EmbedComponent";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

const args = {
  role: new DiscordRoleArgument({
    description: "The role to disable the command for",
    required: true,
  }),
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
    required: true,
  }),
};

export class RoleDisable extends PermissionsChildCommand<typeof args> {
  idSeed = "kep1er hikaru";

  description = "Disable a command for a role";
  usage = ["command @role"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "roleenable",
      variation: ["roleenable"],
      description: "Re-enable a command for a role",
      separateSlashCommand: true,
    },
  ];

  arguments = args;

  async run() {
    const role = this.parsedArguments.role!;
    const commandName = this.parsedArguments.command;

    const extract = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    const command = extract?.command;

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.role,
      commandID: command.id,
      entityID: role.id,
      guildID: this.requiredGuild.id,
    });

    if (
      !this.variationWasUsed("roleenable") &&
      !this.extract.didMatch("enable")
    ) {
      const embed = await this.handleDisable(command, permission, role);

      await this.send(embed);
    } else {
      const embed = await this.handleEnable(command, permission, role);

      await this.send(embed);
    }
  }

  private async handleDisable(
    command: Command,
    permission: Permission,
    role: Role
  ): Promise<EmbedComponent> {
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

    return this.authorEmbed()
      .setHeader("Permissions role disable")
      .setDescription(
        `Successfully ${deletedAllow ? "un-allowed" : "disabled"} ${code(
          command.name
        )} for ${mentionRole(role.id)}`
      );
  }

  private async handleEnable(
    command: Command,
    permission: Permission,
    role: Role
  ): Promise<EmbedComponent> {
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

    return this.authorEmbed()
      .setHeader("Permissions role enable")
      .setDescription(
        `Successfully ${allowed ? "allowed" : "enabled"} ${code(
          command.name
        )} for ${mentionRole(role.id)}`
      );
  }
}
