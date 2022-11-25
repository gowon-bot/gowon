import { Command } from "../../lib/command/Command";
import { BotStatsService } from "../../services/dbservices/BotStatsService";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { displayNumber } from "../../lib/views/displays";
import { Emoji } from "../../lib/Emoji";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { roles } from "../../lib/command/access/roles";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { extraWideSpace } from "../../helpers/specialCharacters";
import { ago } from "../../helpers";
import { ArgumentsMap } from "../../lib/context/arguments/types";

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

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const [commandRunCount, topCommands, cachedPlaycount, lilacUserInfo] =
      await Promise.all([
        this.botStatsService.countUserCommandRuns(this.ctx, dbUser.discordID),
        this.botStatsService.userTopCommands(this.ctx, dbUser.discordID),
        this.mirrorballUsersService.getCachedPlaycount(
          this.ctx,
          discordUser?.id || dbUser.discordID
        ),
        this.lilacUsersService.fetchUser(this.ctx, {
          discordID: dbUser.discordID,
        }),
      ]);

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
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
      `**Last updated**: ${lilacUserInfo?.lastUpdated ? ago(lilacUserInfo.lastUpdated) : "(never)"
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
            return `${extraWideSpace}${command?.secretCommand
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

    const embed = this.newEmbed()
      .setTitle(
        `User info for ${discordUser!.username}#${discordUser!.discriminator}`
      )
      .setDescription(lineConsolidator.consolidate());

    await this.send(embed);
  }
}
