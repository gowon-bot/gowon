import { MessageEmbed } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CommandNotFoundError } from "../../../errors/errors";
import { code, mentionRole } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
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

    const { command } = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.role,
      commandID: command.id,
      entityID: role.id,
    });

    let embed: MessageEmbed;

    if (
      !this.variationWasUsed("roleenable") &&
      !this.runAs.variationWasUsed("enable")
    ) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions role disable"))
        .setDescription(
          `Successfully disabled ${code(command.name)} for ${mentionRole(
            role.id
          )}`
        );
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions role enable"))
        .setDescription(
          `Successfully enabled ${code(command.name)} for ${mentionRole(
            role.id
          )}`
        );
    }

    await this.send(embed);
  }
}
