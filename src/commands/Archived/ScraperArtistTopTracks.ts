import { LastFMBaseCommand } from "../Lastfm/LastFMBaseCommand";

export default class ScraperArtistTopTracks extends LastFMBaseCommand {
  idSeed = "gwsn anne";

  archived = true;

  description = "Shows your top tracks from an artist";
  aliases = ["satt"];
  usage = ["", "artist @user"];
  subcategory = "library";

  async run() {}
}
