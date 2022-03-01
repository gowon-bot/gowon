import { LastFMBaseCommand } from "../../LastFMBaseCommand";

export default class OldArtistRank extends LastFMBaseCommand {
  idSeed = "cignature ye ah";

  description = "Shows what rank an artist is in your top 1000 artists";
  subcategory = "ranks";

  // Merged with the old artist around
  archived = true;

  async run() {}
}
