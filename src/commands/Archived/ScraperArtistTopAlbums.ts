import { LastFMBaseCommand } from "../Lastfm/LastFMBaseCommand";

export default class ScraperArtistTopAlbums extends LastFMBaseCommand {
  idSeed = "nature gaga";

  archived = true;

  description = "Shows your top albums from an artist";
  aliases = ["satl", "satal"];
  usage = ["", "artist @user"];
  subcategory = "library";

  async run() {}
}
