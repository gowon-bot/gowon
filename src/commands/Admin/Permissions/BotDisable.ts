import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CommandNotFoundError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { Emoji } from "../../../lib/emoji/Emoji";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

const args = {
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
    required: true,
  }),
};

export class BotDisable extends PermissionsChildCommand<typeof args> {
  idSeed = "kep1er youngeun";

  description = "Disable a command bot-wide";
  usage = ["command"];

  devCommand = true;

  variations: Variation[] = [
    {
      name: "botenable",
      variation: ["botenable"],
      description: "Re-enable a command bot-wide",
    },
  ];

  arguments = args;

  async run() {
    const commandName = this.parsedArguments.command;

    const command = (
      await this.commandRegistry.find(commandName, this.requiredGuild.id)
    )?.command;

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.bot,
      commandID: command.id,
    });

    if (!this.variationWasUsed("botenable")) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `Successfully disabled ${code(command.name)} bot-wide`
      );

      await this.reply(embed);
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      const embed = new SuccessEmbed().setDescription(
        `${Emoji.checkmark} Successfully enabled ${code(command.name)} bot-wide`
      );

      await this.reply(embed);
    }
  }
}
