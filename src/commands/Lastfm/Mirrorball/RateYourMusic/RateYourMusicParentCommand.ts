import { CommandManager } from "../../../../lib/command/CommandManager";
import { ParentCommand } from "../../../../lib/command/ParentCommand";
import { mirrorballGuilds } from "../../../../lib/indexing/MirrorballCommands";
import { ArtistRatings } from "./ArtistRatings";
import { Help } from "./Help";
import { ImportRatings } from "./Import";
import { Link } from "./Link";
import { Rating } from "./Rating";
import { Stats } from "./Stats";

export default class RateYourMusicParentCommand extends ParentCommand {
  idSeed = "sonamoo euijin";

  subcategory = "rateyourmusic";
  description =
    "Allows you to import and view stats about your rateyourmusic data";
  friendlyName = "rateyourmusic";

  rollout = {
    guilds: mirrorballGuilds,
  };

  canSkipPrefixFor = ["importratings", "rating", "artistratings"];

  prefixes = ["rateyourmusic", "rym", "ryms"];
  default = () => new Link();

  children = new CommandManager({
    importratings: () => new ImportRatings(),
    link: () => new Link(),
    rating: () => new Rating(),
    artistratings: () => new ArtistRatings(),
    stats: () => new Stats(),
    help: () => new Help(),
  });
}
