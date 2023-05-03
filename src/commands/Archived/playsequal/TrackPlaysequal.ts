import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class TrackPlaysequal extends LastFMBaseCommand {
  idSeed = "gugudan soyee";

  aliases = ["trpe", "tpe"];
  description =
    "Shows you how many tracks you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  archived = true;

  async run() {}
}
