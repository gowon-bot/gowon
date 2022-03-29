import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Variation } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { CommandNotFoundError } from "../../../errors/errors";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { MessageEmbed } from "discord.js";
import { bold, code } from "../../../helpers/discord";

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

  description = "Ban a user from using a command.";
  usage = ["command @user/user ID"];
  aliases = ["blacklist"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "userenable",
      variation: ["userenable", "whitelist"],
      description: "Unban a user from using a command",
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
      await this.permissionsService.createPermission(
        this.ctx,
        command,
        permission
      );

      embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions user disable"))
        .setDescription(
          `Successfully disabled ${code(command.name)} for ${bold(user.tag)} (${
            user.id
          })`
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
          `Successfully re-enabled ${code(command.name)} for ${bold(
            user.tag
          )} (${user.id})`
        );
    }

    await this.send(embed);
  }
}
