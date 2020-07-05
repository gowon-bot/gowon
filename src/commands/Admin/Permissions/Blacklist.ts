import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
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

  arguments: Arguments = {
    inputs: this.arguments.inputs,
    mentions: {
      entities: { index: { start: 0 } },
    },
  };

  async run(message: Message, runAs: RunAs) {
    let { users: userMentions, roles: roleMentions } = message.mentions;

    let userPermissions = await addNamesToPermissions(
      message,
      await Promise.all(
        userMentions.map((um) =>
          this.adminService.whiteOrBlacklist(
            um.id,
            message.guild?.id!,
            this.command.name,
            false,
            runAs.lastString() !== "whitelist"
          )
        )
      )
    );

    let rolePermissions = await addNamesToPermissions(
      message,
      await Promise.all(
        roleMentions.map((rm) =>
          this.adminService.whiteOrBlacklist(
            rm.id,
            message.guild?.id!,
            this.command.name,
            true,
            runAs.lastString() !== "whitelist"
          )
        )
      )
    );

    let embed = new MessageEmbed()
      .setTitle(`New permissions`)
      .setDescription(
        `${
          runAs.lastString() === "whitelist" ? "Whitelisted" : "Blacklisted"
        } \`${this.command.name}\` for:\n` +
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
