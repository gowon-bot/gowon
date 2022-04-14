import { CommandGroup } from "../../../../lib/command/CommandGroup";
import { LastFMBaseParentCommand } from "../../LastFMBaseCommand";
import { Add } from "./Add";
import { Help } from "./Help";
import { Preview } from "./Preview";
import { React } from "./React";
import { Remove } from "./Remove";
import { Set as SetCommand } from "./Set";
import { View } from "./View";

export default class NowPlayingConfigParentCommand extends LastFMBaseParentCommand {
  idSeed = "weeekly soeun";

  subcategory = "config";
  description = "Allows you to change how your nowplaying embeds look";
  friendlyName = "nowplayingconfig";
  customHelp = Help;

  prefixes = ["npc", "nowplayingconfig"];
  default = () => new View();

  slashCommand = true;

  noPrefixAliases = ["react", "reacts", "reactions"];

  children: CommandGroup = new CommandGroup(
    [View, SetCommand, Help, Preview, Add, Remove, React],
    this.id
  );
}
