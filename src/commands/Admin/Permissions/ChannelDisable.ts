import { Channel, MessageEmbed } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { NotTextChannelError } from "../../../errors/discord";
import { CommandNotFoundError } from "../../../errors/errors";
import {
  PermissionAlreadyExistsError,
  PermissionDoesNotExistError,
} from "../../../errors/permissions";
import { mentionChannel, code } from "../../../helpers/discord";
import { Command, Variation } from "../../../lib/command/Command";
import { ChannelArgument } from "../../../lib/context/arguments/argumentTypes/discord/ChannelArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

const args = {
  channel: new ChannelArgument({
    description: "The channel to disable the command in",
    required: true,
  }),
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
    required: true,
  }),
};

export class ChannelDisable extends PermissionsChildCommand<typeof args> {
  idSeed = "red velvet wendy";

  description = "Disable or un-allow a command in a channel";
  usage = ["command #channel"];
  aliases = ["channelblacklist", "channeldisable"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "channelenable",
      variation: ["channelenable", "channelunblacklist"],
      description: "Re-enable or allow a command in a channel",
      separateSlashCommand: true,
    },
  ];

  arguments = args;

  async run() {
    const channel = this.parsedArguments.channel!;
    const commandName = this.parsedArguments.command;

    if (channel.type !== "GUILD_TEXT") throw new NotTextChannelError();

    const { command } = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.channel,
      commandID: command.id,
      entityID: channel.id,
      guildID: this.requiredGuild.id,
    });

    let embed: MessageEmbed;

    if (
      !this.variationWasUsed("channelenable") &&
      !this.runAs.variationWasUsed("enable")
    ) {
      embed = await this.handleDisable(command, permission, channel);
    } else {
      embed = await this.handleEnable(command, permission, channel);
    }

    await this.send(embed);
  }

  private async handleDisable(
    command: Command,
    permission: Permission,
    channel: Channel
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
      .setAuthor(this.generateEmbedAuthor("Permissions channel disable"))
      .setDescription(
        `Successfully ${deletedAllow ? "un-allowed" : "disabled"} ${code(
          command.name
        )} in ${mentionChannel(channel.id)}`
      );
  }

  private async handleEnable(
    command: Command,
    permission: Permission,
    channel: Channel
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
      .setAuthor(this.generateEmbedAuthor("Permissions channel enable"))
      .setDescription(
        `Successfully ${allowed ? "allowed" : "enabled"} ${code(
          command.name
        )} in ${mentionChannel(channel.id)}`
      );
  }
}
