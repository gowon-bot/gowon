import { CommandManager } from "../../../../lib/command/CommandManager";
import { ParentCommand } from "../../../../lib/command/ParentCommand";
import { ArtistRatings } from "./ArtistRatings";
import { Help } from "./Help";
import { ImportRatings } from "./Import";
import { Link } from "./Link";
import { Rating } from "./Rating";
import { Ratings } from "./Ratings";
import { Stats } from "./Stats";

export default class RateYourMusicParentCommand extends ParentCommand {
  idSeed = "sonamoo euijin";

  subcategory = "rateyourmusic";
  description =
    "Allows you to import and view stats about your rateyourmusic data";
  friendlyName = "rateyourmusic";

  canSkipPrefixFor = ["importratings", "rating", "artistratings", "ratings"];

  prefixes = ["rateyourmusic", "rym", "ryms"];
  default = () => new Link();

  children = new CommandManager({
    importratings: () => new ImportRatings(),
    link: () => new Link(),
    rating: () => new Rating(),
    artistratings: () => new ArtistRatings(),
    stats: () => new Stats(),
    help: () => new Help(),
    ratings: () => new Ratings(),
  });
}
