import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { addNamesToPermissions } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";

export class Blacklist extends PermissionsChildCommand {
  description = "Add a user to the blacklist for a command";

  variations: Variation[] = [
    {
      variationString: "whitelist",
      description: "Add a user to the whitelist for a command",
    },
  ];

  async run(message: Message, runAs: RunAs) {
    let userPermissions = await addNamesToPermissions(
      message,
      await Promise.all(
        this.users.map((user) =>
          this.adminService.whiteOrBlacklist(
            user.id,
            message.guild?.id!,
            this.command.id,
            false,
            runAs.lastString() !== "whitelist",
            this.runAs.toCommandFriendlyName()
          )
        )
      )
    );

    let rolePermissions = await addNamesToPermissions(
      message,
      await Promise.all(
        this.roles.map((role) =>
          this.adminService.whiteOrBlacklist(
            role.id,
            message.guild?.id!,
            this.command.id,
            true,
            runAs.lastString() !== "whitelist",
            this.runAs.toCommandFriendlyName()
          )
        )
      )
    );

    let embed = new MessageEmbed()
      .setTitle(`New permissions`)
      .setDescription(
        `${
          runAs.lastString() === "whitelist" ? "Whitelisted" : "Blacklisted"
        } \`${this.runAs.toCommandFriendlyName()}\` for:\n` +
          (rolePermissions.length
            ? `Roles: ${rolePermissions.map((rp) => rp.name).join(", ")}\n`
            : "") +
          (userPermissions.length
            ? `Users: ${userPermissions.map((up) => up.name).join(", ")}`
            : "")
      );

    await message.channel.send(embed);
  }
}
