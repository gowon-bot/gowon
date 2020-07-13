import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed, User, Role } from "discord.js";

export class Delist extends PermissionsChildCommand {
  description = "Remove a user/role from a white/blacklist";
  aliases = ["dewhitelist", "deblacklist"];

  async run(message: Message) {
    let delisted: Array<Role | User> = [];
    let failed: Array<{ entity: Role | User; reason: string }> = [];

    for (let entity of [...this.users, ...this.roles]) {
      try {
        await this.adminService.delist(
          entity.id,
          message.guild?.id!,
          this.command.id
        );
      } catch (e) {
        failed.push({ entity, reason: e.message });
      }
    }
      
    let embed = new MessageEmbed()
      .setTitle(`Removed permissions`)
      .setDescription(
        `Delisted \`${this.runAs.toCommandFriendlyName()}\` for ${delisted
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
            : "")
      );

    await message.channel.send(embed);
  }
}
