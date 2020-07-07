import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { addNamesToPermissions } from "../../../helpers/discord";

export class Delist extends PermissionsChildCommand {
  description = "Remove a user/role from a white/blacklist";
  aliases = ["dewhitelist", "deblacklist"];

  async run(message: Message) {
    let delisted = await addNamesToPermissions(
      message,
      await Promise.all(
        [...this.users, ...this.roles].map((mention) =>
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
        `Delisted \`${this.runAs.toCommandFriendlyName()}\` for ${delisted
          .map((d) => d.name)
          .join(", ")}`
      );

    await message.channel.send(embed);
  }
}
