import { LastFMBaseChildCommand } from "../Lastfm/LastFMBaseCommand";
import { OverviewStatsCalculator } from "../../lib/OverviewStatsCalculator";
import { Message, User } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";

export abstract class OverviewChildCommand extends LastFMBaseChildCommand {
  parentName = "overview";

  calculator!: OverviewStatsCalculator;

  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async prerun(message: Message) {
    let user = (this.parsedArguments.user as User) || message.author;

    let username = await this.usersService.getUsername(user.id);

    this.calculator = new OverviewStatsCalculator(
      username,
      user.id,
      message.guild?.id!,
      this.logger
    );
  }
}
