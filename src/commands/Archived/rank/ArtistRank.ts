import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class ArtistRank extends LastFMBaseCommand {
  idSeed = "cignature ye ah";

  description = "Shows what rank an artist is in your top 1000 artists";
  subcategory = "ranks";

  archived = true;

  async run() {}
}
