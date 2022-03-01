import { CommandGroup } from "../../../../lib/command/CommandGroup";
import { ParentCommand } from "../../../../lib/command/ParentCommand";
import { ArtistRatings } from "./ArtistRatings";
import { Help } from "./Help";
import { ImportRatings } from "./Import";
import { Link } from "./Link";
import { Rating } from "./Rating";
import { Ratings } from "./Ratings";
import { Stats } from "./Stats";
import { Taste } from "./Taste";

export default class RateYourMusicParentCommand extends ParentCommand {
  idSeed = "sonamoo euijin";

  subcategory = "rateyourmusic";
  description =
    "Allows you to import and view stats about your rateyourmusic data";
  friendlyName = "rateyourmusic";

  slashCommand = true;

  noPrefixAliases = [
    // Import
    "rymimport",
    "rymsimport",
    "importratings",
    // Rating
    "rating",
    // Artistratings
    "ara",
    "artistratings",
    // Ratings
    "ratings",
    // Taste
    "tasteratings",
    "ratingstaste",
  ];

  prefixes = ["rateyourmusic", "rym", "ryms"];
  default = () => new Link();

  children = new CommandGroup([
    ArtistRatings,
    Help,
    ImportRatings,
    Link,
    Rating,
    Ratings,
    Stats,
    Taste,
  ]);
}
