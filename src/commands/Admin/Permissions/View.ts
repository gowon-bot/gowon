import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { MessageEmbed, Role } from "discord.js";
import {
  addNamesToPermissions,
  NamedPermission,
} from "../../../helpers/discord";
import { displayNumber } from "../../../lib/views/displays";

interface GroupedPermissions {
  [permission: string]: number;
}

export class View extends PermissionsChildCommand {
  idSeed = "loona haseul";

  description =
    "View the permissions in the server, for a specific command, or for a specific user/role";

  usage = ["", "command", "role:roleid or @role", "user:userid or @user"];

  throwOnNoCommand = false;
  aliases = ["list"];

  async run() {
    let permissions: NamedPermission[] = [];
    let embed: MessageEmbed;

    if (this.command) {
      permissions = await addNamesToPermissions(
        this.ctx,
        await this.adminService.listPermissionsForCommand(
          this.ctx,
          this.command.id
        )
      );

      embed = this.newEmbed()
        .setTitle(
          `Permissions for ${this.commandRunAs
            .toCommandFriendlyName()
            .code()} in ${this.guild?.name}`
        )
        .setDescription(
          permissions.length
            ? "This command is " +
                (permissions[0].isBlacklist
                  ? "blacklisted for"
                  : "whitelisted for") +
                "\n" +
                permissions
                  .map((p) => p.name + (p.isRoleBased ? " (role)" : ""))
                  .join(", ")
            : `This server doesn't have any permissions set for ${this.commandRunAs
                .toCommandFriendlyName()
                .code()}!`
        );
    } else if (this.users.length || this.roles.length) {
      let entity = this.users[0] ?? this.roles[0];
      let entityName = entity instanceof Role ? entity.name : entity.username;

      permissions = await addNamesToPermissions(
        this.ctx,
        await this.adminService.listPermissionsForEntity(this.ctx, entity.id)
      );

      let blacklisted = permissions.filter((p) => p.isBlacklist);
      let whitelisted = permissions.filter((p) => !p.isBlacklist);

      embed = this.newEmbed()
        .setTitle(`Permissions for ${entityName.code()} in ${this.guild?.name}`)
        .setDescription(
          permissions.length
            ? (blacklisted.length
                ? `Blacklisted for ` +
                  blacklisted
                    .map((p) => p.commandFriendlyName.code())
                    .join(", ") +
                  "\n"
                : "") +
                (whitelisted.length
                  ? `Whitelisted for ` +
                    whitelisted
                      .map((p) => p.commandFriendlyName.code())
                      .join(", ")
                  : "")
            : `This server doesn't have any permissions set for ${entityName.code()}!`
        );
    } else {
      permissions = await addNamesToPermissions(
        this.ctx,
        await this.adminService.listPermissions(this.ctx)
      );

      let groupedPermissions = permissions.reduce((acc, p) => {
        if (!acc[p.commandFriendlyName]) acc[p.commandFriendlyName] = 1;
        else acc[p.commandFriendlyName] += 1;

        return acc;
      }, {} as GroupedPermissions);

      embed = this.newEmbed()
        .setTitle(`Permissions for ${this.guild?.name}`)
        .setDescription(
          permissions.length
            ? Object.keys(groupedPermissions)
                .map(
                  (p) =>
                    `${p.code()} - ${displayNumber(
                      groupedPermissions[p],
                      "permission"
                    )}`
                )
                .join("\n")
            : "This server doesn't have any permissions set yet!"
        );
    }

    await this.send(embed);
  }
}
