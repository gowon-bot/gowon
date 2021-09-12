import { TextChannel } from "discord.js";
import { Variation } from "../../../lib/command/BaseCommand";
import { validators } from "../../../lib/validation/validators";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class ChannelBlacklist extends PermissionsChildCommand {
  idSeed = "red velvet wendy";

  description = "Prevent a command from being used in a channel";
  usage = ["command #channel", "command #channel #channel2"];
  variations: Variation[] = [
    {
      name: "unblacklist",
      variation: "channelunblacklist",
      description: "Re-allow a command to be used in a channel",
    },
  ];

  validation = {
    command: new validators.Required({}),
  };

  async run() {
    const mentionedChannels = Array.from(
      this.message.mentions.channels.values()
    );

    const blacklistedChannels = {
      success: [] as string[],
      failed: [] as { channel: string; reason: string }[],
    };

    for (const channel of mentionedChannels as TextChannel[]) {
      if (channel.type !== "GUILD_TEXT") continue;

      try {
        !this.variationWasUsed("i")
          ? await this.adminService.blacklistCommandFromChannel(
              this.ctx,
              this.guild.id,
              this.command.id,
              channel.id
            )
          : await this.adminService.unblacklistCommandFromChannel(
              this.ctx,
              this.guild.id,
              this.command.id,
              channel.id
            );

        blacklistedChannels.success.push(channel.name);
      } catch (e) {
        blacklistedChannels.failed.push({
          channel: channel.name,
          reason: e.message,
        });
      }
    }

    let embed = this.newEmbed().setDescription(
      `${
        blacklistedChannels.success.length
          ? "**Success**: " +
            blacklistedChannels.success.map((c) => `#${c}`).join(", ")
          : ""
      }
      ${
        blacklistedChannels.failed.length
          ? "**Failed**: ```\n" +
            blacklistedChannels.failed
              .map((c) => `#${c.channel}: ${c.reason}`)
              .join("\n") +
            "```"
          : ""
      }`
    );

    await this.send(embed);
  }
}
