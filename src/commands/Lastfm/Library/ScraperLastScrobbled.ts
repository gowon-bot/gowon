import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ScraperLastScrobbled extends LastFMBaseCommand {
  idSeed = "gwsn lena";

  archived = true;

  description = "Shows the last time you scrobbled a song";
  aliases = ["slast"];
  usage = ["", "artist | track @user"];
  subcategory = "library";

  async run() {}
}
