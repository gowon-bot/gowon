import { LastFMBaseCommand } from "../../LastFMBaseCommand";

export default class OldTrackRank extends LastFMBaseCommand {
  idSeed = "cignature seline";

  description = "Shows what rank a track is at in your top 1000 tracks";
  subcategory = "ranks";

  // Merged with the old track around command
  archived = true;

  async run() {}
}
