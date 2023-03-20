import { CrownsChildCommand } from "../../Lastfm/Crowns/CrownsChildCommand";

export class GuildUserRank extends CrownsChildCommand {
  idSeed = "wjsn exy";

  aliases = ["rank", "guildrank", "serverrank", "r"];
  description =
    "Ranks a user on the crowns leaderboard based on their crown count";
  usage = ["", "@user"];

  archived = true;

  async run() {}
}
