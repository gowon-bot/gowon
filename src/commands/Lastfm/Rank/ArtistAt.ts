import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistAt extends LastFMBaseCommand {
  idSeed = "cignature jeewon";

  aliases = ["aa"];
  description = "Finds the artist in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  archived = true;

  async run() {}
}
