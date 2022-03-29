import { MessageEmbed } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CommandNotFoundError, LogicError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { CommandRedirect, Variation } from "../../../lib/command/Command";
import { ChannelArgument } from "../../../lib/context/arguments/argumentTypes/discord/ChannelArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DisableInChannel } from "./DisableInChannel";
import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { UserDisable } from "./UserDisable";

const args = {
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
    required: true,
  }),
  channel: new ChannelArgument({
    description: "The channel to disable the command in",
  }),
  user: new DiscordUserArgument({
    description: "The user to disable the command for",
  }),
} as const;

export class Disable extends PermissionsChildCommand<typeof args> {
  idSeed = "red velvet yeri";

  description = "Disable a command";
  usage = "command";

  variations: Variation[] = [
    {
      name: "enable",
      variation: "enable",
      description: "Re-enable a command",
      separateSlashCommand: true,
    },
  ];

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !!args.user,
      redirectTo: UserDisable,
    },
    {
      when: (args) => !!args.channel,
      redirectTo: DisableInChannel,
    },
  ];

  slashCommand = true;

  // Remove mentions inherited from child command
  arguments = args;

  async run() {
    const commandName = this.parsedArguments.command;

    const { command } = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    if (["enable", "disable"].includes(command.name))
      throw new LogicError(
        `You can't disable the ${code(command.name)} command!`
      );

    const permission = Permission.create({
      type: PermissionType.guild,
      commandID: command.id,
      entityID: this.requiredGuild.id,
    });

    let embed: MessageEmbed;

    if (!this.variationWasUsed("enable")) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions disable"))
        .setDescription(`Successfully disabled ${code(command.name)}`);
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions enable"))
        .setDescription(`Successfully enabled ${code(command.name)}`);
    }

    await this.send(embed);
  }
}
