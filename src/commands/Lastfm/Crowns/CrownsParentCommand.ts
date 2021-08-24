import { CommandRegistry } from "../../../lib/command/CommandRegistry";
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

  children: CommandRegistry = new CommandRegistry({
    check: () => new Check(),
    info: () => new Info(),
    list: () => new List(),
    checkmany: () => new CheckMany(),
    topcrowns: () => new TopCrowns(),
    contentiouscrowns: () => new ContentiousCrowns(),
    guild: () => new Guild(),
    dm: () => new DM(),
    setinactiverole: () => new SetInactiveRole(),
    setpurgatoryrole: () => new SetPurgatoryRole(),
    optout: () => new OptOut(),
    optin: () => new OptIn(),
    rank: () => new Rank(),
    kill: () => new Kill(),
    recentlystolen: () => new RecentlyStolen(),
    ban: () => new Ban(),
    unban: () => new Unban(),
    crownranks: () => new CrownRanks(),
    banartist: () => new BanArtist(),
    unbanartist: () => new UnbanArtist(),
    history: () => new History(),
    guildat: () => new GuildAt(),
    guildaround: () => new GuildAround(),
  });
}
