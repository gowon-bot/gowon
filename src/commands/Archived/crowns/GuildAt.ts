import { CrownsChildCommand } from "../../Lastfm/Crowns/CrownsChildCommand";

export class GuildAt extends CrownsChildCommand {
  idSeed = "wjsn bona";

  description =
    "Shows the user at a given rank on the crowns leaderboard, and the surrounding users";
  usage = "rank";

  archived = true;

  async run() {}
}
