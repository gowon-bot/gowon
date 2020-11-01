import { RunAs } from "../../../lib/AliasChecker";
import { Variation } from "../../../lib/command/BaseCommand";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class ChannelBlacklist extends PermissionsChildCommand {
  description = "Blacklist command from channel";
  usage = ["command #channel", "command #channel #channel2"];
  variations: Variation[] = [{ variationString: "channelunblacklist" }];

  throwOnNoCommand = true;

  async run(_: any, runAs: RunAs) {
    let mentionedChannels = this.message.mentions.channels.array();

    let blacklistedChannels = {
      success: [] as string[],
      failed: [] as { channel: string; reason: string }[],
    };

    for (let channel of mentionedChannels) {
      try {
        !runAs.variationWasUsed("channelunblacklist")
          ? await this.adminService.blacklistCommandFromChannel(
              this.guild.id,
              this.command.id,
              channel.id
            )
          : await this.adminService.unblacklistCommandFromChannel(
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
