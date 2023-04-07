import { CommandGroup } from "../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Add } from "./Add";
import { Alias } from "./Alias";
import { AlbumPlays } from "./Commands/AlbumPlays";
import { ArtistPlays } from "./Commands/ArtistPlays";
import { Joined } from "./Commands/Joined";
import { Rating } from "./Commands/Rating";
import { Scrobbles } from "./Commands/Scrobbles";
import { TrackPlays } from "./Commands/TrackPlays";
import { WhoFirstArtist } from "./Commands/WhoFirstArtist";
import { Help } from "./Help";
import { List } from "./List";
import { Remove } from "./Remove";
import { RemoveAll } from "./RemoveAll";

export default class FriendsParentCommand extends LastFMBaseParentCommand {
  idSeed = "nature lu";

  description = "Manage friends, allowing you to see various stats about them";

  friendlyName = "friends";
  subcategory = "friends";
  customHelp = Help;

  prefixes = ["friends", "fr", "friend"];
  default = () => new List();

  noPrefixAliases = [
    // Add
    "addfriend",
    "addfriends",
    // Remove
    "removefriend",
    "removefriends",
    // TrackPlays
    "friendswhoknowstrack",
    "fwkt",
    // AlbumPlays
    "friendswhoknowsalbum",
    "fwkl",
    // ArtistPlays
    "friendswhoknows",
    "friendswhoknowsartist",
    "fwk",
  ];

  children: CommandGroup = new CommandGroup(
    [
      Add,
      Alias,
      Help,
      List,
      Remove,
      RemoveAll,

      // Commands/
      ArtistPlays,
      AlbumPlays,
      TrackPlays,
      Scrobbles,
      Joined,
      Rating,
      WhoFirstArtist,
    ],
    this.id
  );
}
