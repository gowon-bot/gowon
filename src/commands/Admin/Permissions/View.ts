import { channelMention, roleMention, userMention } from "@discordjs/builders";
import {
  Permission,
  PermissionType,
} from "../../../database/entity/Permission";
import { code, italic } from "../../../helpers/discord";
import { emDash } from "../../../helpers/specialCharacters";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ChannelArgument } from "../../../lib/context/arguments/argumentTypes/discord/ChannelArgument";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { PermissionQuery } from "../../../lib/permissions/PermissionsCacheService";
import { displayNumberedList } from "../../../lib/ui/displays";
import { ErrorEmbed } from "../../../lib/ui/embeds/ErrorEmbed";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

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
} satisfies ArgumentsMap;

export class View extends PermissionsChildCommand<typeof args> {
  idSeed = "loona haseul";

  description = "View the permissions in this server";

  usage = ["", "command", "@role", "@user", "#channel", "--all"];
  aliases = ["list"];

  slashCommand = true;

  arguments = args;

  private readonly allHelp = "To see all permissions, run with the --all flag";

  async run() {
    const query = await this.getQueries();

    const permissions = await this.permissionsService.listPermissions(
      this.ctx,
      query
    );

    const embed = this.minimalEmbed().setTitle(
      `Permissions in ${this.guild?.name}`
    );

    if (!permissions.length) {
      await this.reply(
        new ErrorEmbed().setDescription(
          `No permissions found! ${
            !this.parsedArguments.all ? this.allHelp : ""
          }`
        )
      );

      return;
    }

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: permissions,
      pageSize: 15,
      pageRenderer: (items, { offset }) => {
        const renderedItems = items.map((p) => this.displayPermission(p));

        return displayNumberedList(renderedItems, offset);
      },
      overrides: {
        itemName: "permission",
        embedDescription:
          !this.parsedArguments.all &&
          !this.parsedArguments.user &&
          !this.parsedArguments.channel &&
          !this.parsedArguments.role
            ? italic(this.allHelp) + "\n"
            : "",
      },
    });

    await this.reply(scrollingEmbed);
  }

  private async getQueries(): Promise<PermissionQuery[]> {
    const all = this.parsedArguments.all;
    const extract = await this.commandRegistry.find(
      this.parsedArguments.command || "",
      this.requiredGuild.id
    );

    const commandID = extract?.command?.id;

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
    const commandName =
      this.commandRegistry.findByID(permission.commandID, {
        includeSecret: true,
      })?.friendlyName || "<unknown command>";

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
