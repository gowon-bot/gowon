import { CommandGroup } from "../../../lib/command/CommandGroup";
import { GuildAt } from "../../Archived/crowns/GuildAt";
import { GuildUserRank } from "../../Archived/crowns/GuildRank";
import { Unban } from "../../Archived/crowns/Unban";
import { UnbanArtist } from "../../Archived/crowns/UnbanArtist";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { Ban } from "./Ban";
import { BanArtist } from "./BanArtist";
import { Check } from "./Check";
import { CheckMany } from "./CheckMany";
import { ContentiousCrowns } from "./ContentiousCrowns";
import { CrownRanks } from "./CrownRanks";
import { DM } from "./DM";
import { Guild } from "./Guild";
import { GuildAround } from "./GuildAround";
import { History } from "./History";
import { Info } from "./Info";
import { Kill } from "./Kill";
import { List } from "./List";
import { OptIn } from "./OptIn";
import { OptOut } from "./OptOut";
import { RecentlyStolen } from "./RecentlyStolen";
import { SetInactiveRole } from "./SetInactiveRole";
import { SetPurgatoryRole } from "./SetPurgatoryRole";
import { Tag } from "./Tag";
import { TopCrowns } from "./TopCrowns";

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

  slashCommand = true;

  children: CommandGroup = new CommandGroup(
    [
      Ban,
      BanArtist,
      Check,
      CheckMany,
      ContentiousCrowns,
      CrownRanks,
      DM,
      Guild,
      GuildAround,
      GuildAt,
      History,
      Info,
      List,
      Kill,
      OptIn,
      OptOut,
      GuildUserRank,
      RecentlyStolen,
      SetInactiveRole,
      SetPurgatoryRole,
      Tag,
      TopCrowns,
      Unban,
      UnbanArtist,
    ],
    this.id
  );
}
