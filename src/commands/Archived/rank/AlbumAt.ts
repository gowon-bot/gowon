import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class AlbumAt extends LastFMBaseCommand {
  idSeed = "gugudan hyeyeon";

  aliases = ["ala"];
  description = "Finds the album in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  archived = true;

  async run() {}
}
