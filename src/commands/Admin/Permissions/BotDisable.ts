import { MessageEmbed } from "discord.js";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { CommandNotFoundError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
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

    const { command } = await this.commandRegistry.find(
      commandName,
      this.requiredGuild.id
    );

    if (!command) throw new CommandNotFoundError();

    const permission = Permission.create({
      type: PermissionType.bot,
      commandID: command.id,
    });

    let embed: MessageEmbed;

    if (!this.variationWasUsed("botenable")) {
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions bot disable"))
        .setDescription(`Successfully disabled ${code(command.name)} bot-wide`);
    } else {
      await this.permissionsService.destroyPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions bot enable"))
        .setDescription(`Successfully enabled ${code(command.name)} bot-wide`);
    }

    await this.send(embed);
  }
}
