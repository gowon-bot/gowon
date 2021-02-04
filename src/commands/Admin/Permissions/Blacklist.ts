import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, Role, User } from "discord.js";
import { Variation } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { RunAs } from "../../../lib/command/RunAs";

export class Blacklist extends PermissionsChildCommand {
  idSeed = "red velvet irene";

  description =
    "Blacklist/whitelist a user/role from using a command.\nSee permissions help for more info";

  usage = ["command @role or role:roleid", "command @user or user:userid"];

  variations: Variation[] = [
    {
      variationString: "whitelist",
      description: "Add a user to the whitelist for a command",
    },
  ];

  validation: Validation = {
    command: new validators.Required({}),
  };

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
          !runAs.variationWasUsed("whitelist"),
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
          !runAs.variationWasUsed("whitelist"),
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

    let embed = this.newEmbed()
      .setTitle(`New permissions`)
      .setDescription(
        `${
          runAs.variationWasUsed("whitelist") ? "Whitelisted" : "Blacklisted"
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

    await this.send(embed);
  }
}
