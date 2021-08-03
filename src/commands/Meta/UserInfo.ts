import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { BotStatsService } from "../../services/dbservices/BotStatsService";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { CommandManager } from "../../lib/command/CommandManager";
import { displayNumber } from "../../lib/views/displays";
import { Emoji } from "../../lib/Emoji";

const args = {
  inputs: {},
  mentions: standardMentions,
} as const;

export default class UserInfo extends BaseCommand<typeof args> {
  idSeed = "exid le";

  subcategory = "developer";
  description = "Show stats about a single user";
  aliases = ["ui"];
  usage = ["", "<discord id>"];

  arguments: Arguments = args;

  botStatsService = new BotStatsService();
  commandManager = new CommandManager();

  async run() {
    await this.commandManager.init();

    const { dbUser, discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const commandRunCount = await this.botStatsService.countUserCommandRuns(
      dbUser.discordID
    );

    const topCommands = await this.botStatsService.userTopCommands(
      dbUser.discordID
    );

    const cachedPlaycount = await this.mirrorballService.getCachedPlaycount(
      discordUser?.id || dbUser.discordID
    );

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        string: `${Emoji.checkmark} Authenticated!\n`,
        shouldDisplay: !!dbUser.lastFMSession,
      },
      {
        string: `${Emoji.bruh} Not authenticated! \`${this.prefix}login\`\n`,
        shouldDisplay: !dbUser.lastFMSession,
      },
      `**Cached scrobbles**: ${displayNumber(cachedPlaycount)}`,
      `**Commands run**: ${displayNumber(commandRunCount)}`,
      {
        shouldDisplay: topCommands.length > 0,
        string: `**Top commands**: \n${topCommands
          .slice(0, 5)
          .map((c) => {
            const command = this.commandManager.findByID(c.commandID);

            // This is a special space
            return ` ${
              command?.friendlyNameWithParent ||
              command?.friendlyName ||
              "<unknown command>"
            } - ${displayNumber(c.uses)}`;
          })
          .join("\n")}`,
      }
    );

    const embed = this.newEmbed()
      .setTitle(
        `User info for ${discordUser!.username}#${discordUser!.discriminator}`
      )
      .setDescription(lineConsolidator.consolidate());

    await this.send(embed);
  }
}
