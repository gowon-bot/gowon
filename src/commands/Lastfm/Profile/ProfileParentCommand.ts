import { CommandGroup } from "../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { AvgPerDay } from "./AvgPerDay";
import { Breadth } from "./Breadth";
import { Crowns } from "./Crowns";
import { HIndex } from "./HIndex";
import { Help } from "./Help";
import { Joined } from "./Joined";
import { Overview } from "./Overview";
import { Per } from "./Per";
import { Playsover } from "./Playsover";
import { ScrobblesPerAlbum } from "./ScrobblesPerAlbum";
import { ScrobblesPerArtist } from "./ScrobblesPerArtist";
import { ScrobblesPerTrack } from "./ScrobblesPerTrack";
import { SumTop } from "./SumTop";
import { TopPercent } from "./TopPercent";

export default class ProfileParentCommand extends LastFMBaseParentCommand {
  idSeed = "snsd sooyoung";

  subcategory = "library";
  description =
    "Shows information about you and your library. Run overview all to see an example";
  friendlyName = "profile";
  customHelp = Help;

  slashCommand = true;

  prefixes = ["profile", "pf", "o", "overview"];
  default = () => new Overview();

  noPrefixAliases = [
    // Breadth
    "breadth",
    "div",
    // H-Index
    "hindex",
    "hidx",
    // Joined
    "joined",
  ];

  children: CommandGroup = new CommandGroup(
    [
      Overview,
      Joined,
      AvgPerDay,
      ScrobblesPerArtist,
      ScrobblesPerAlbum,
      ScrobblesPerTrack,
      Per,
      HIndex,
      Help,
      TopPercent,
      SumTop,
      Crowns,
      Breadth,
      Playsover,
    ],
    this.id
  );
}
