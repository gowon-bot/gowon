import { CrownsChildCommand } from "../../Lastfm/Crowns/CrownsChildCommand";

export class Unban extends CrownsChildCommand {
  idSeed = "wjsn yeonjung";

  description = "Unbans a user from the crowns game";
  usage = "@user";

  archived = true;

  async run() {}
}
