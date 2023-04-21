import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class AlbumPlaysequal extends LastFMBaseCommand {
  idSeed = "gugudan haebin";

  aliases = ["alpe", "lpe"];
  description =
    "Shows you how many albums you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  archived = true;

  async run() {}
}
