import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Role, User } from "discord.js";
import { Variation } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export class Blacklist extends PermissionsChildCommand {
  idSeed = "red velvet irene";

  description =
    "Blacklist/whitelist a user/role from using a command.\nSee permissions help for more info";

  usage = ["command @role or role:roleid", "command @user or user:userid"];

  variations: Variation[] = [
    {
      name: "whitelist",
      variation: "whitelist",
      description: "Add a user to the whitelist for a command",
    },
  ];

  validation: Validation = {
    command: new validators.Required({}),
  };

  async run() {
    let createdRolePermissions: Array<Role> = [];
    let createdUserPermissions: Array<User> = [];
    let failed: Array<{ entity: Role | User; reason: string }> = [];

    for (let role of this.roles) {
      try {
        await this.adminService.whiteOrBlacklist(
          this.ctx,
          role.id,
          this.command.id,
          true,
          !this.variationWasUsed("whitelist"),
          this.commandRunAs.toCommandFriendlyName()
        );

        createdRolePermissions.push(role);
      } catch (e: any) {
        failed.push({
          entity: role,
          reason: e.message,
        });
      }
    }

    for (let user of this.users) {
      try {
        await this.adminService.whiteOrBlacklist(
          this.ctx,
          user.id,
          this.command.id,
          false,
          !this.variationWasUsed("whitelist"),
          this.commandRunAs.toCommandFriendlyName()
        );

        createdUserPermissions.push(user);
      } catch (e: any) {
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
          this.variationWasUsed("whitelist") ? "Whitelisted" : "Blacklisted"
        } ${this.commandRunAs.toCommandFriendlyName().code()} for:\n` +
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
