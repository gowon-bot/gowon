import { Chance } from "chance";
import { bold } from "../../helpers/discord";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {} satisfies ArgumentsMap;

export class Cooldown extends FishyChildCommand<typeof args> {
  idSeed = "csr geumhee";
  aliases = ["timer", "fishytimer", "fst", "fc"];

  description = "See when you can fish next";

  arguments = args;

  async run() {
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      autoCreateFishyProfile: true,
      fishyProfileRequired: true,
    });

    const embed = this.authorEmbed().setHeader("Fishy cooldown");

    if (!fishyProfile.canFish()) {
      await this.send(
        embed.setDescription(
          `You can fish again in ${bold(fishyProfile.getCooldownTime())}.`
        )
      );
    } else {
      await this.send(embed.setDescription(this.pickCanFishMessage()));
    }
  }

  private pickCanFishMessage(): string {
    return Chance().pickone([
      "✨ Good news! You can fish **now**.",
      "🐠 You see fish in the water, you can fish **now**!",
      "🐟 You see fish in the water, you can fish **now**!",
      "🐡 You see fish in the water, you can fish **now**!",
      "🎣 You can fish **now**!",
    ]);
  }
}
