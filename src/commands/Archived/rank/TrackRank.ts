import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class TrackRank extends LastFMBaseCommand {
  idSeed = "cignature seline";

  description = "Shows what rank a track is at in your top 1000 tracks";
  subcategory = "ranks";

  archived = true;

  async run() {}
}
