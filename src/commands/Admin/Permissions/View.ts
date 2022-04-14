import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { code, italic } from "../../../helpers/discord";
import { displayNumberedList } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { PermissionQuery } from "../../../lib/permissions/PermissionsCacheService";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ChannelArgument } from "../../../lib/context/arguments/argumentTypes/discord/ChannelArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { channelMention, roleMention, userMention } from "@discordjs/builders";
import { emDash } from "../../../helpers/specialCharacters";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";

const args = {
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to view permissions for",
  }),
  channel: new ChannelArgument({
    description: "The channel to view permissions for",
  }),
  user: new DiscordUserArgument({
    description: "The user to view permissions for",
  }),
  role: new DiscordRoleArgument({
    description: "The role to view permissions for",
  }),
  all: new Flag({
    description: "Show all permissions",
    longnames: ["all"],
    shortnames: ["a"],
  }),
} as const;

export class View extends PermissionsChildCommand<typeof args> {
  idSeed = "loona haseul";

  description = "View the permissions in this server";

  usage = ["", "command", "role:roleid or @role", "user:userid or @user"];
  aliases = ["list"];

  slashCommand = true;

  arguments = args;

  async run() {
    const query = await this.getQueries();

    const permissions = await this.permissionsService.listPermissions(
      this.ctx,
      query
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Permissions"))
      .setTitle(`Permissions in ${this.guild?.name}`);

    if (!permissions.length) {
      embed.setDescription(
        `No guild permissions found! To see all commands, run \`${this.prefix}permissions view --all\``
      );
      await this.send(embed);
      return;
    }

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: permissions,
      pageSize: 15,
      pageRenderer: (items, { offset }) => {
        const renderedItems = items.map((p) => this.displayPermission(p));

        return displayNumberedList(renderedItems, offset);
      },
      overrides: {
        itemName: "permissions",
        embedDescription:
          !this.parsedArguments.all &&
          !this.parsedArguments.user &&
          !this.parsedArguments.channel &&
          !this.parsedArguments.role
            ? italic(`To see all permissions, run with the --all flag`) + "\n"
            : "",
      },
    });

    scrollingEmbed.send();
  }

  private async getQueries(): Promise<PermissionQuery[]> {
    const all = this.parsedArguments.all;
    const { command } = await this.commandRegistry.find(
      this.parsedArguments.command || "",
      this.requiredGuild.id
    );

    const commandID = command?.id;

    const queries = [] as PermissionQuery[];

    if (all || commandID || this.parsedArguments.channel) {
      queries.push({
        commandID,
        type: PermissionType.channel,
        entityID: this.parsedArguments.channel?.id,
      });
    }

    if (all || commandID || this.parsedArguments.user) {
      queries.push({
        commandID,
        type: PermissionType.guildMember,
        entityID: this.parsedArguments.user
          ? `${this.requiredGuild.id}:${this.parsedArguments.user.id}`
          : undefined,
      });
    }

    if (all || commandID || this.parsedArguments.role) {
      queries.push({
        commandID,
        type: PermissionType.role,
        entityID: this.parsedArguments.role?.id,
      });
    }

    if (
      all ||
      (!this.parsedArguments.user &&
        !this.parsedArguments.channel &&
        !this.parsedArguments.role)
    ) {
      queries.push({
        commandID,
        type: PermissionType.guild,
        entityID: this.requiredGuild.id,
      });
    }

    return queries;
  }

  private displayPermission(permission: Permission): string {
    const commandName = this.commandRegistry.findByID(
      permission.commandID
    )!.friendlyName;

    let extra = "";

    switch (permission.type) {
      case PermissionType.guildMember:
        const [_, userID] = permission.entityID!.split(":");
        extra = ` ${emDash} ${userMention(userID)}`;
        break;
      case PermissionType.channel:
        extra = ` ${emDash} ${channelMention(permission.entityID!)}`;
        break;
      case PermissionType.role:
        extra = ` ${emDash} ${roleMention(permission.entityID!)}`;
        break;
    }

    return `${code(commandName)}${extra}${
      permission.allow ? italic(" (allow)") : ""
    }`;
  }
}
