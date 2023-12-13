import { ArgumentsMap } from "../../lib/context/arguments/types";
import { AquariumEmbed } from "../../lib/views/embeds/AquariumEmbed";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {} satisfies ArgumentsMap;

export class Aquarium extends FishyChildCommand<typeof args> {
  idSeed = "csr seoyeon";
  aliases = ["aq"];

  description =
    "Take a look at your aquarium, and see the fishy swimming around!";

  arguments = args;

  async run() {
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
    });

    const aquarium = await this.fishyService.getAquarium(fishyProfile);

    const embed = new AquariumEmbed(this.authorEmbed(), aquarium);

    await this.send(embed);
  }
}
