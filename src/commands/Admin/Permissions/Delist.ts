import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { User, Role } from "discord.js";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export class Delist extends PermissionsChildCommand {
  idSeed = "red velvet joy";

  description = "Remove a user/role from a white/blacklist";
  usage = ["command @role or role:roleid", "command @user or user:userid"];

  aliases = ["dewhitelist", "deblacklist", "unwhitelist", "unblacklist"];

  validation: Validation = {
    command: new validators.Required({}),
  };

  async run() {
    let delisted: Array<Role | User> = [];
    let failed: Array<{ entity: Role | User; reason: string }> = [];

    for (let entity of [...this.users, ...this.roles]) {
      try {
        await this.adminService.delist(this.ctx, entity.id, this.command.id);

        delisted.push(entity);
      } catch (e) {
        failed.push({ entity, reason: e.message });
      }
    }

    const commandName = this.runAs.toCommandFriendlyName();

    const description =
      `Delisted ${commandName.code()} for ${delisted
        .map((d) => (d instanceof Role ? d.name + " (role)" : d.username))
        .join(", ")}` +
      (failed.length
        ? "\n\n**Failed**\n" +
          failed
            .map(
              (f) =>
                (f.entity instanceof Role
                  ? f.entity.name + " (role)"
                  : f.entity.username) +
                " - " +
                f.reason
            )
            .join("\n")
        : "");

    let embed = this.newEmbed()
      .setTitle(`Removed permissions`)
      .setDescription(description);

    await this.send(embed);
  }
}
