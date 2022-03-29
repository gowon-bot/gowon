import { MessageEmbed } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { NotTextChannelError } from "../../../errors/discord";
import { CommandNotFoundError } from "../../../errors/errors";
import { mentionChannel, code } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
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

export class DisableInChannel extends PermissionsChildCommand<typeof args> {
  idSeed = "red velvet wendy";

  description = "Disable a command in a channel";
  usage = ["command #channel", "command #channel"];
  aliases = ["channelblacklist", "channeldisable"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "enableinchannel",
      variation: ["enableinchannel", "channelunblacklist", "channelenable"],
      description: "Re-enable a command in a channel",
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
    });

    let embed: MessageEmbed;

    if (
      !this.variationWasUsed("enableinchannel") &&
      !this.runAs.variationWasUsed("enable")
    ) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions channel disable"))
        .setDescription(
          `Successfully disabled ${code(command.name)} in ${mentionChannel(
            channel.id
          )}`
        );
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions enable"))
        .setDescription(
          `Successfully enabled ${code(command.name)} in ${mentionChannel(
            channel.id
          )}`
        );
    }

    await this.send(embed);
  }
}
