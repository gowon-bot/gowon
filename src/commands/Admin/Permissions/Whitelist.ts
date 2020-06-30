import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";

export class Whitelist extends PermissionsChildCommand {
  description = "Add a user to the whitelist for a command";

  arguments: Arguments = {
    inputs: this.arguments.inputs,
    mentions: {
      entities: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let { users: userMentions, roles: roleMentions } = message.mentions;

    let userPermissions = await Promise.all(
      userMentions.map((um) =>
        this.adminService.whitelist(
          um.id,
          message.guild?.id!,
          this.command.name,
          false
        )
      )
    );

    let rolePermissions = await Promise.all(
      roleMentions.map((rm) =>
        this.adminService.whitelist(
          rm.id,
          message.guild?.id!,
          this.command.name,
          true
        )
      )
    );

    let embed = new MessageEmbed()
      .setTitle(`New permissions`)
      .setDescription(
        `Whitelisted \`${this.command.name}\` for:\n` +
          (rolePermissions.length
            ? `Roles: ${rolePermissions
                .map((rp) => "`" + rp + "`")
                .join(", ")}\n`
            : "") +
          (userPermissions.length
            ? `Roles: ${userPermissions.map((up) => "`" + up + "`").join(", ")}`
            : "")
      );

    await message.channel.send(embed);
  }
}
