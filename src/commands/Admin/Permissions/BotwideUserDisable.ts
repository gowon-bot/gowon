import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CommandNotFoundError } from "../../../errors/errors";
import { bold, code } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { displayUserTag } from "../../../lib/ui/displays";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

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

export class BotwideUserDisable extends PermissionsChildCommand<typeof args> {
  idSeed = "kep1er yeseo";

  description = "Ban a user from using a command (bot-wide).";
  usage = ["command @user/user ID"];

  devCommand = true;

  variations: Variation[] = [
    {
      name: "botwideuserenable",
      variation: ["botwideuserenable"],
      description: "Unban a user from using a command (bot-wide)",
    },
  ];

  arguments = args;

  async run() {
    const user = this.parsedArguments.user!;
    const commandName = this.parsedArguments.command;

    const command = (
      await this.commandRegistry.find(commandName, this.requiredGuild.id)
    )?.command;

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.user,
      commandID: command.id,
      entityID: user.id,
    });

    if (!this.variationWasUsed("botwideuserenable")) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `Successfully disabled ${code(command.name)} for ${bold(
          displayUserTag(user)
        )} (${user.id}) bot-wide`
      );

      await this.reply(embed);
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `Successfully re-enabled ${code(command.name)} for ${bold(
          displayUserTag(user)
        )} (${user.id}) bot-wide`
      );

      await this.reply(embed);
    }
  }
}
