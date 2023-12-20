import { GuildAtResponse } from "../../../database/entity/Crown";
import { User } from "../../../database/entity/User";
import { UserHasNoCrownsInServerError } from "../../../errors/commands/crowns";
import { UnknownError } from "../../../errors/errors";
import { asyncMap } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
  rank: new NumberArgument({
    description: "The rank to view on the leaderboard",
  }),
} as const;

export class GuildAround extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki doyeon";

  aliases = ["guildme", "rank", "guildrank", "serverrank", "r", "guildat"];
  description =
    "Ranks a user based on their crown count, and shows the surrounding users";
  usage = ["", "@user"];

  arguments = args;

  async run() {
    const { discordUser, dbUser } = await this.getMentions({
      fetchDiscordUser: true,
      dbUserRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const guildAround = await this.getGuildAround(
      dbUser,
      this.parsedArguments.rank
    );

    const highlightedRank = this.parsedArguments.rank
      ? this.parsedArguments.rank
      : 0;

    const highlighted = highlightedRank
      ? undefined
      : guildAround.users.find((u) => u.discordID === dbUser.discordID);

    if (!guildAround.users.length || !(highlighted || highlightedRank)) {
      throw new UserHasNoCrownsInServerError(perspective);
    }

    const guildAroundUsers = await asyncMap(guildAround.users, async (u) => ({
      ...u,
      username: await this.fetchUsername(u.discordID),
    }));

    const embed = this.authorEmbed()
      .setHeader("Crowns rank")
      .setTitle(`${this.requiredGuild.name}'s crown leaderboard`)
      .setDescription(
        displayNumberedList(
          guildAroundUsers.map((u, idx) => {
            const rank = guildAroundUsers[0].rank - 1 + idx;

            const display = `${u.username} with ${displayNumber(
              u.count,
              "crown"
            )}`;

            return u.discordID === highlighted?.discordID ||
              rank === highlightedRank - 1
              ? bold(display)
              : display;
          }),
          guildAroundUsers[0].rank - 1
        )
      );

    await this.send(embed);
  }

  private async getGuildAround(
    dbUser: User | undefined,
    rank: number | undefined
  ): Promise<GuildAtResponse> {
    const serverUserIDs = await this.serverUserIDs({
      filterCrownBannedUsers: true,
    });

    if (rank) {
      return await this.crownsService.guildAt(this.ctx, rank, serverUserIDs);
    } else if (dbUser) {
      return await this.crownsService.guildAround(
        this.ctx,
        this.requiredGuild.id,
        dbUser.id,
        serverUserIDs
      );
    } else {
      throw new UnknownError();
    }
  }
}
