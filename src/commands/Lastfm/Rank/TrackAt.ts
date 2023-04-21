import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackAt extends LastFMBaseCommand {
  idSeed = "cignature sunn";

  aliases = ["ta"];
  description = "Finds the track in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  archived = true;

  async run() {}
}
