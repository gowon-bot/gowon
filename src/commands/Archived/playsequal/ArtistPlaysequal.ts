import { LastFMBaseCommand } from "../../Lastfm/LastFMBaseCommand";

export default class ArtistPlaysequal extends LastFMBaseCommand {
  idSeed = "gugudan sejeong";

  aliases = ["pe", "ape"];
  description =
    "Shows you how many artists you have equal to a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  archived = true;

  async run() {}
}
