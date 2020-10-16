import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed, Role } from "discord.js";
import { numberDisplay } from "../../../helpers";
import {
  addNamesToPermissions,
  NamedPermission,
} from "../../../helpers/discord";

interface GroupedPermissions {
  [permission: string]: number;
}

export class View extends PermissionsChildCommand {
  description =
    "View the permissions in the server, for a specific command, or for a specific user/role";

  usage = [
    "",
    "command",
    "role:roleid or @role",
    "user:userid or @user",
  ]

  throwOnNoCommand = false;
  aliases = ["list"];

  async run(message: Message) {
    let permissions: NamedPermission[] = [];
    let embed: MessageEmbed;

    if (this.command) {
      permissions = await addNamesToPermissions(
        message,
        await this.adminService.listPermissionsForCommand(
          message.guild?.id!,
          this.command.id
        )
      );

      embed = new MessageEmbed()
        .setTitle(
          `Permissions for ${this.runAs.toCommandFriendlyName().code()} in ${
            message.guild?.name
          }`
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
            : `This server doesn't have any permissions set for ${this.runAs.toCommandFriendlyName().code()}!`
        );
    } else if (this.users.length || this.roles.length) {
      let entity = this.users[0] ?? this.roles[0];
      let entityName = entity instanceof Role ? entity.name : entity.username;

      permissions = await addNamesToPermissions(
        message,
        await this.adminService.listPermissionsForEntity(
          message.guild?.id!,
          entity.id
        )
      );

      let blacklisted = permissions.filter((p) => p.isBlacklist);
      let whitelisted = permissions.filter((p) => !p.isBlacklist);

      embed = new MessageEmbed()
        .setTitle(`Permissions for ${entityName.code()} in ${message.guild?.name}`)
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
        message,
        await this.adminService.listPermissions(message.guild?.id!)
      );

      let groupedPermissions = permissions.reduce((acc, p) => {
        if (!acc[p.commandFriendlyName]) acc[p.commandFriendlyName] = 1;
        else acc[p.commandFriendlyName] += 1;

        return acc;
      }, {} as GroupedPermissions);

      embed = new MessageEmbed()
        .setTitle(`Permissions for ${message.guild?.name}`)
        .setDescription(
          permissions.length
            ? Object.keys(groupedPermissions).map(
                (p) =>
                  `${p.code()} - ${numberDisplay(
                    groupedPermissions[p],
                    "permission"
                  )}`
              )
            : "This server doesn't have any permissions set yet!"
        );
    }

    await this.send(embed);
  }
}
