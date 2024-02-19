import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CannotDisableCommandError } from "../../../errors/commands/permissions";
import { CommandNotFoundError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { CommandRedirect, Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ChannelArgument } from "../../../lib/context/arguments/argumentTypes/discord/ChannelArgument";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { ChannelDisable } from "./ChannelDisable";
import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { RoleDisable } from "./RoleDisable";
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
  role: new DiscordRoleArgument({
    description: "The role to disable the command for",
  }),
} satisfies ArgumentsMap;

export class Disable extends PermissionsChildCommand<typeof args> {
  idSeed = "red velvet yeri";

  description = "Disable or un-allow a command";
  usage = "command";

  variations: Variation[] = [
    {
      name: "enable",
      variation: "enable",
      description: "Re-enable or allow a command",
      separateSlashCommand: true,
    },
  ];

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !!args.user,
      redirectTo: UserDisable,
    },
    {
      when: (args) => !!args.role,
      redirectTo: RoleDisable,
    },
    {
      when: (args) => !!args.channel,
      redirectTo: ChannelDisable,
    },
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    const commandName = this.parsedArguments.command;

    const extract = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    const command = extract?.command;

    if (!command) throw new CommandNotFoundError();

    if (["enable", "disable"].includes(command.name)) {
      throw new CannotDisableCommandError(command.name);
    }

    const permission = Permission.create({
      type: PermissionType.guild,
      commandID: command.id,
      entityID: this.requiredGuild.id,
      guildID: this.requiredGuild.id,
    });

    if (!this.variationWasUsed("enable")) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `Successfully disabled ${code(command.name)} for this server`
      );

      await this.reply(embed);
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `Successfully re-enabled ${code(command.name)} for this server`
      );

      await this.reply(embed);
    }
  }
}
