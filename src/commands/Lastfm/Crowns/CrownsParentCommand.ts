import { CommandGroup } from "../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Check } from "./Check";
import { Info } from "./Info";
import { List } from "./List";
import { DM } from "./DM";
import { CheckMany } from "./CheckMany";
import { TopCrowns } from "./TopCrowns";
import { ContentiousCrowns } from "./ContentiousCrowns";
import { Guild } from "./Guild";
import { SetInactiveRole } from "./SetInactiveRole";
import { OptOut } from "./OptOut";
import { OptIn } from "./OptIn";
import { Rank } from "./Rank";
import { Kill } from "./Kill";
import { RecentlyStolen } from "./RecentlyStolen";
import { SetPurgatoryRole } from "./SetPurgatoryRole";
import { Ban } from "./Ban";
import { Unban } from "./Unban";
import { History } from "./History";
import { GuildAround } from "./GuildAround";
import { CrownRanks } from "./CrownRanks";
import { BanArtist } from "./BanArtist";
import { UnbanArtist } from "./UnbanArtist";
import { GuildAt } from "./GuildAt";

export default class CrownsParentCommand extends LastFMBaseParentCommand {
  idSeed = "weki meki lua";

  friendlyName = "crowns";
  description =
    "See who has the most plays for an artist!\nCrowns are not automatic, to claim a crown see crown check";
  subcategory = "games";

  prefixes = ["crowns", "cw"];
  default = () => new List();
  noPrefixAliases = [
    // Check
    "c",
    "w",
    // Checkmany
    "cm",
    // Info
    "wh",
    // History
    "ch",
  ];

  children: CommandGroup = new CommandGroup([
    Check,
    Info,
    List,
    CheckMany,
    TopCrowns,
    ContentiousCrowns,
    Guild,
    DM,
    SetInactiveRole,
    SetPurgatoryRole,
    OptOut,
    OptIn,
    Rank,
    Kill,
    RecentlyStolen,
    Ban,
    Unban,
    CrownRanks,
    BanArtist,
    UnbanArtist,
    History,
    GuildAt,
    GuildAround,
  ]);
}
