import { CommandRun } from "../../database/entity/meta/CommandRun";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

type UserTopCommands = {
  commandID: string;
  uses: string;
}[];

export class BotStatsService extends BaseService {
  async countUserCommandRuns(
    ctx: GowonContext,
    discordID: string
  ): Promise<number> {
    this.log(ctx, `Counting command runs for user ${discordID}`);
    return await CommandRun.count({ userID: discordID });
  }

  async userTopCommands(
    ctx: GowonContext,
    discordID: string
  ): Promise<UserTopCommands> {
    this.log(ctx, `Fetching top commands for user ${discordID}`);

    return (await CommandRun.getRepository().query(
      `SELECT
        "commandID", count(*) AS uses FROM command_runs
      WHERE "userID"=$1
      GROUP BY "commandID"
      ORDER BY 2 DESC`,
      [discordID]
    )) as UserTopCommands;
  }
}
