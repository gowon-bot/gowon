import { ArgumentsMap } from "../../lib/context/arguments/types";
import { AquariumEmbed } from "../../lib/ui/embeds/AquariumEmbed";
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

    const embed = this.minimalEmbed()
      .setTitle("Your aquarium")
      .transform(AquariumEmbed)
      .setAquarium(aquarium);

    await this.reply(embed);
  }
}
