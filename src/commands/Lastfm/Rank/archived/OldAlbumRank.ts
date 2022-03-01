import { LastFMBaseCommand } from "../../LastFMBaseCommand";

export default class OldAlbumRank extends LastFMBaseCommand {
  idSeed = "cignature chaesol";

  description = "Shows what rank a given album is in your top 1000 albums";
  subcategory = "ranks";

  // Merged with old album around
  archived = true;

  async run() {}
}
