import { ago } from "../../helpers";
import { extraWideSpace } from "../../helpers/specialCharacters";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { Command } from "../../lib/command/Command";
import { roles } from "../../lib/command/access/roles";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
import { displayNumber } from "../../lib/ui/displays";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { BotStatsService } from "../../services/dbservices/BotStatsService";
import { LilacLibraryService } from "../../services/lilac/LilacLibraryService";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export default class UserInfo extends Command<typeof args> {
  idSeed = "exid le";

  subcategory = "developer";
  description = "Show stats about a single user";
  aliases = ["ui"];
  usage = ["", "<discord id>"];

  slashCommand = true;

  arguments = args;

  botStatsService = ServiceRegistry.get(BotStatsService);
  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const [commandRunCount, topCommands, cachedPlaycount, lilacUserInfo] =
      await Promise.all([
        this.botStatsService.countUserCommandRuns(this.ctx, dbUser.discordID),
        this.botStatsService.userTopCommands(this.ctx, dbUser.discordID),
        this.lilacLibraryService.getScrobbleCount(
          this.ctx,
          discordUser?.id || dbUser.discordID
        ),
        this.lilacUsersService.fetch(this.ctx, {
          discordID: dbUser.discordID,
        }),
      ]);

    const description = new LineConsolidator().addLines(
      {
        string: `${dbUser.roles
          ?.map((r) => `${Emoji[r]} ${roles[r].friendlyName}`)
          ?.join("\n")}`,
        shouldDisplay: !!dbUser.roles?.length,
      },
      {
        string: `${Emoji.gowonPatreon} Patron!`,
        shouldDisplay: dbUser.isPatron,
      },
      {
        string: `${Emoji.checkmark} Authenticated!`,
        shouldDisplay: !!dbUser.lastFMSession,
      },
      {
        string: "",
        shouldDisplay: dbUser.isPatron || !!dbUser.lastFMSession,
      },
      {
        string: `${Emoji.bruh} Not authenticated! \`${this.prefix}login\`\n`,
        shouldDisplay: !dbUser.lastFMSession,
      },
      `**Cached scrobbles**: ${displayNumber(cachedPlaycount)}`,
      `**Commands run**: ${displayNumber(commandRunCount)}`,
      `**Last updated**: ${
        lilacUserInfo?.lastUpdated ? ago(lilacUserInfo.lastUpdated) : "(never)"
      }`,
      {
        shouldDisplay: topCommands.length > 0,
        string: `**Top commands**: \n${topCommands
          .slice(0, 5)
          .map((c) => {
            const command = this.commandRegistry.findByID(c.commandID, {
              includeArchived: true,
              includeSecret: true,
            });

            // This is a special space
            return `${extraWideSpace}${
              command?.secretCommand
                ? "<secret command>"
                : command?.friendlyNameWithParent ||
                  command?.friendlyName ||
                  "<unknown command>"
            }${command?.archived ? " [archived]" : ""} - ${displayNumber(
              c.uses
            )}`;
          })
          .join("\n")}`,
      }
    );

    const embed = this.minimalEmbed()
      .setTitle("User info")
      .setDescription(description);

    await this.reply(embed);
  }
}
