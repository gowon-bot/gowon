import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Message, MessageEmbed, Role } from "discord.js";
import { numberDisplay } from "../../../helpers";
import {
  addNamesToPermissions,
  NamedPermission,
} from "../../../helpers/discord";
import { NoCommand } from "../../../lib/command/BaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";

interface GroupedPermissions {
  [permission: string]: number;
}

export class View extends PermissionsChildCommand {
  description =
    "View the permissions in the server, for a specific command, or for a specific user/role";

  throwOnNoCommand = false;
  aliases = ["list"];

  arguments: Arguments = {
    inputs: this.arguments.inputs,
    mentions: {
      entities: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let permissions: NamedPermission[];
    let embed: MessageEmbed;

    let { users, roles } = message.mentions;

    if (this.command && !(this.command instanceof NoCommand)) {
      permissions = await addNamesToPermissions(
        message,
        await this.adminService.listPermissionsForCommand(
          message.guild?.id!,
          this.command.name
        )
      );

      embed = new MessageEmbed()
        .setTitle(
          `Permissions for \`${this.command.name}\` in ${message.guild?.name}`
        )
        .setDescription(
          permissions.length
            ? "This command is " +
                (permissions[0].isBlacklist
                  ? "blacklisted for"
                  : "whitelisted for") +
                "\n" +
                permissions
                  .map((p) => `${p.name}` + (p.isRoleBased ? " (role)" : ""))
                  .join(", ")
            : `This server doesn't have any permissions set for \`${this.command.name}\`!`
        );
    } else if (users.array().length || roles.array().length) {
      let entity = users.array()[0] ?? roles.array()[0];
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
        .setTitle(`Permissions for \`${entityName}\` in ${message.guild?.name}`)
        .setDescription(
          permissions.length
            ? (blacklisted.length
                ? `Blacklisted for ` +
                  blacklisted
                    .map(
                      (p) =>
                        "`" +
                        this.commandManager.findByID(p.commandID)?.name +
                        "`"
                    )
                    .join(", ") +
                  "\n"
                : "") +
                (whitelisted.length
                  ? `Whitelisted for ` +
                    whitelisted
                      .map(
                        (p) =>
                          "`" +
                          this.commandManager.findByID(p.commandID)?.name +
                          "`"
                      )
                      .join(", ")
                  : "")
            : `This server doesn't have any permissions set for \`${entityName}\`!`
        );
    } else {
      permissions = await addNamesToPermissions(
        message,
        await this.adminService.listPermissions(message.guild?.id!)
      );

      let groupedPermissions = permissions.reduce((acc, p) => {
        if (!acc[p.commandID]) acc[p.commandID] = 1;
        else acc[p.commandID] += 1;

        return acc;
      }, {} as GroupedPermissions);

      embed = new MessageEmbed()
        .setTitle(`Permissions for ${message.guild?.name}`)
        .setDescription(
          Object.keys(groupedPermissions).map(
            (p) =>
              `\`${p}\` - ${numberDisplay(groupedPermissions[p], "permission")}`
          )
        );
    }

    await message.channel.send(embed);
  }
}
