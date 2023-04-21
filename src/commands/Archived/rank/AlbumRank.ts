import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class AlbumRank extends LastFMBaseCommand {
  idSeed = "cignature chaesol";

  description = "Shows what rank a given album is in your top 1000 albums";
  subcategory = "ranks";

  archived = true;

  async run() {}
}
