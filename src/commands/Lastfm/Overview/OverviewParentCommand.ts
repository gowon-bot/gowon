import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { All } from "./All";
import { Joined } from "./Joined";
import { AvgPerDay } from "./AvgPerDay";
import { ScrobblesPerArtist } from "./ScrobblesPerArtist";
import { ScrobblesPerAlbum } from "./ScrobblesPerAlbum";
import { ScrobblesPerTrack } from "./ScrobblesPerTrack";
import { Per } from "./Per";
import { HIndex } from "./HIndex";
import { TopPercent } from "./TopPercent";
import { SumTop } from "./SumTop";
import { Crowns } from "./Crowns";
import { Breadth } from "./Breadth";
import { Playsover } from "./Playsover";
import { Help } from "./Help";

export default class OverviewParentCommand extends LastFMBaseParentCommand {
  idSeed = "snsd sooyoung";

  subcategory = "library";
  description =
    "Shows information about you and your library. Run overview all to see an example";
  friendlyName = "overview";
  customHelp = Help;

  prefixes = ["o", "overview"];
  default = () => new All();

  children: CommandManager = new CommandManager({
    all: () => new All(),
    joined: () => new Joined(),
    scrobbles: () => new AvgPerDay(),
    scrobblesPerArtist: () => new ScrobblesPerArtist(),
    scrobblesPerAlbum: () => new ScrobblesPerAlbum(),
    scrobblesPerTrack: () => new ScrobblesPerTrack(),
    per: () => new Per(),
    hindex: () => new HIndex(),
    help: () => new Help(),
    toppercent: () => new TopPercent(),
    sumtop: () => new SumTop(),
    crowns: () => new Crowns(),
    breadth: () => new Breadth(),
    playsover: () => new Playsover(),
  });
}
