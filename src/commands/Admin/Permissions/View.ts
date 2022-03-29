import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { code } from "../../../helpers/discord";
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
import { channelMention, userMention } from "@discordjs/builders";
import { emDash } from "../../../helpers/specialCharacters";

const args = {
  command: new StringArgument({
    index: { start: 0 },
    description: "The command to disable",
  }),
  channel: new ChannelArgument({
    description: "The channel to disable the command in",
  }),
  user: new DiscordUserArgument({
    description: "The user to disable the command for",
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

    const disabledCommands = await this.permissionsService.listPermissions(
      this.ctx,
      query
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Disabled commands"))
      .setTitle(`Disabled commands in ${this.guild?.name}`);

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: disabledCommands,
      pageSize: 15,
      pageRenderer: (items, { offset }) => {
        const renderedItems = items.map((p) => this.displayPermission(p));

        return displayNumberedList(renderedItems, offset);
      },
      overrides: {
        itemName: "disabled command",
      },
    });

    scrollingEmbed.send();
  }

  private async getQueries(): Promise<PermissionQuery[]> {
    const { command } = await this.commandRegistry.find(
      this.parsedArguments.command || "",
      this.requiredGuild.id
    );

    const commandID = command?.id;

    const queries = [] as PermissionQuery[];

    if (commandID || this.parsedArguments.channel) {
      queries.push({
        commandID,
        type: PermissionType.channel,
        entityID: this.parsedArguments.channel?.id,
      });
    }

    if (commandID || this.parsedArguments.user) {
      queries.push({
        commandID,
        type: PermissionType.guildMember,
        entityID: this.parsedArguments.user
          ? `${this.requiredGuild.id}:${this.parsedArguments.user.id}`
          : undefined,
      });
    }

    if (!this.parsedArguments.user && !this.parsedArguments.channel) {
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
    }

    return `${code(commandName)}${extra}`;
  }
}
