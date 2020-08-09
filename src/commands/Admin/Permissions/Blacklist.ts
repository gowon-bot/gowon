import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed, Role, User } from "discord.js";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";

export class Blacklist extends PermissionsChildCommand {
  description = "Add a user to the blacklist for a command";

  usage = ["command @role or role:roleid", "command @user or user:userid"];

  variations: Variation[] = [
    {
      variationString: "whitelist",
      description: "Add a user to the whitelist for a command",
    },
  ];

  async run(message: Message, runAs: RunAs) {
    let createdRolePermissions: Array<Role> = [];
    let createdUserPermissions: Array<User> = [];
    let failed: Array<{ entity: Role | User; reason: string }> = [];

    for (let role of this.roles) {
      try {
        await this.adminService.whiteOrBlacklist(
          role.id,
          message.guild?.id!,
          this.command.id,
          true,
          runAs.lastString() !== "whitelist",
          this.runAs.toCommandFriendlyName()
        );

        createdRolePermissions.push(role);
      } catch (e) {
        failed.push({
          entity: role,
          reason: e.message,
        });
      }
    }

    for (let user of this.users) {
      try {
        await this.adminService.whiteOrBlacklist(
          user.id,
          message.guild?.id!,
          this.command.id,
          false,
          runAs.lastString() !== "whitelist",
          this.runAs.toCommandFriendlyName()
        );

        createdUserPermissions.push(user);
      } catch (e) {
        failed.push({
          entity: user,
          reason: e.message,
        });
      }
    }

    let embed = new MessageEmbed()
      .setTitle(`New permissions`)
      .setDescription(
        `${
          runAs.lastString() === "whitelist" ? "Whitelisted" : "Blacklisted"
        } ${this.runAs.toCommandFriendlyName().code()} for:\n` +
          (createdRolePermissions.length
            ? `Roles: ${createdRolePermissions
                .map((rp) => rp.name)
                .join(", ")}\n`
            : "") +
          (createdUserPermissions.length
            ? `Users: ${createdUserPermissions
                .map((up) => up.username)
                .join(", ")}`
            : "") +
          (failed.length
            ? "\n\n**Failed**\n" +
              failed
                .map(
                  (f) =>
                    `${
                      f.entity instanceof Role
                        ? f.entity.name + " (role)"
                        : f.entity.username
                    } - ${f.reason}`
                )
                .join("\n")
            : "")
      );

    await message.channel.send(embed);
  }
}
