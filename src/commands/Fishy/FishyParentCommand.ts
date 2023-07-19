import { CommandGroup } from "../../lib/command/CommandGroup";
import { ParentCommand } from "../../lib/command/ParentCommand";
import { Aquarium } from "./Aquarium";
import { Collection } from "./Collection";
import { Cooldown } from "./Cooldown";
import { Fish } from "./Fish";
import { Fishypedia } from "./Fishypedia";
import { Help } from "./Help";
import { Profile } from "./Profile";
import { Quest } from "./Quest";
import { fishyAliases } from "./fishyAliases";

export default class FishyParentCommand extends ParentCommand {
  idSeed = "le sserafim kazuha";

  description = "Distract your mind from scrobbles and go fishing";
  friendlyName = "fishy";

  prefixes = ["fishy"];
  default = () => new Fish();
  customHelp = Help;

  category = "fishy";

  noPrefixAliases = [
    // Fish
    "fish",
    ...fishyAliases.filter((a) => a !== "fishy"),
    // Fishypedia
    "fishypedia",
    // Cooldown
    "fishytimer",
    "fst",
    "fc",
    // Stats
    "fishystats",
    "fs",
    "fishyprofile",
    "fp",
    //Aquarium
    "aquarium",
    "aq",
    // Quest
    "fishyquest",
    "fq",
  ];

  children = new CommandGroup(
    [Aquarium, Collection, Cooldown, Fish, Fishypedia, Help, Profile, Quest],
    this.id
  );
}
