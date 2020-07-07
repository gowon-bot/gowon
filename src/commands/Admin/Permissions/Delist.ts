import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { addNamesToPermissions } from "../../../helpers/discord";

export class Delist extends PermissionsChildCommand {
  description = "Remove a user/role from a white/blacklist";
  aliases = ["dewhitelist", "deblacklist"];

  arguments: Arguments = {
    inputs: this.arguments.inputs,
    mentions: {
      entities: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let { users: userMentions, roles: roleMentions } = message.mentions;

    let delisted = await addNamesToPermissions(
      message,
      await Promise.all(
        [...userMentions.array(), ...roleMentions.array()].map((mention) =>
          this.adminService.delist(
            mention.id,
            message.guild?.id!,
            this.command.id
          )
        )
      )
    );

    let embed = new MessageEmbed()
      .setTitle(`Removed permissions`)
      .setDescription(
        `Delisted \`${this.command.name}\` for ${delisted
          .map((d) => d.name)
          .join(", ")}`
      );

    await message.channel.send(embed);
  }
}
