import { CommandGroup } from "../../lib/command/CommandGroup";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { Aquarium } from "./Aquarium";
import { Collection } from "./Collection";
import { Cooldown } from "./Cooldown";
import { Fish } from "./Fish";
import { Stats } from "./Stats";
import { Fishypedia } from "./Wiki";

export default class FishyParentCommand extends ParentCommand {
  idSeed = "le sserafim kazuha";

  description = "Distract your mind from scrobbles and go fishing";
  friendlyName = "fishy";

  prefixes = ["fishy"];
  default = () => new Fish();

  category = "fishy";

  noPrefixAliases = [
    // Fish
    "fish",
    "fosh",
    "foshy",
    "fush",
    "fushy",
    "gofish",
    // Wiki
    "fishypedia",
    // Cooldown
    "fishytimer",
    "fst",
    "fc",
    // Stats
    "fishystats",
    "fs",
    //Aquarium
    "aquarium",
    "aq",
  ];

  children = new CommandGroup(
    [Aquarium, Collection, Cooldown, Fish, Stats, Fishypedia],
    this.id
  );
}
