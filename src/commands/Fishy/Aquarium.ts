import { Chance } from "chance";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumber } from "../../lib/views/displays";
import { Fishy } from "../../services/fishy/Fishy";
import {
  AquariumDimensions,
  AquariumDisplay,
  Aquarium as AquariumType,
} from "../../services/fishy/FishyService.types";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {} satisfies ArgumentsMap;

export class Aquarium extends FishyChildCommand<typeof args> {
  idSeed = "csr seoyeon";
  aliases = ["aq"];

  description =
    "Take a look at your aquarium, and see the fishy swimming around!";

  arguments = args;

  private readonly aquariumWidth: number = 8;
  private readonly aquariumHeight: number = 5;

  async run() {
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
    });

    const aquarium = await this.fishyService.getAquarium(fishyProfile);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy aquarium"))
      .setTitle("Your aquarium")
      .setDescription(
        this.displayAquarium(aquarium, {
          width: this.aquariumWidth,
          height: this.aquariumHeight,
        })
      );

    await this.send(embed);
  }

  private displayAquarium(
    aquarium: AquariumType,
    aquariumDimensions: AquariumDimensions
  ): string {
    const fishies = aquarium.fishies.map((f) => f.fishy);

    const aquariumTank = new AquariumDisplay().render(
      aquariumDimensions,
      fishies
    );

    const aquariumMessage = this.getAquariumMessage(fishies);

    return `
_${aquariumMessage}_

${aquariumTank}

There **${displayNumber(aquarium.size)} total fishy** in your aquarium.
${
  aquarium.size === 0
    ? ``
    : "The most abundant fish is ${bold(aquarium.mostAbundantFish.name)}."
}
`;
  }

  private getAquariumMessage(fishy: Fishy[]): string {
    const fishyCount = fishy.length;

    if (fishyCount === 0) {
      return Chance().pickone([
        "No fishies? :(",
        "There doesn't seem to be a fishy in sight!",
        "There are no fishy around right now...",
        "🐈 Naan has scared away all the fishy!",
      ]);
    } else if (fishyCount === 1) {
      const fishyFriend = fishy[0];

      return Chance().pickone([
        `Only a single ${fishyFriend.name} came out to see you!`,
        `A ${fishyFriend.name} is all alone in the tank, they must've missed the invite to the fishy party`,
        `A ${fishyFriend.name} seems to be the only fishy around`,
        `The sole ${fishyFriend.name} in the tank is staring at you.`,
      ]);
    } else if (fishyCount <= 3) {
      return Chance().pickone([
        `There only seem to be ${fishyCount} around right now!`,
        `You can only see ${fishyCount}, the rest must be hiding!`,
        `One fish, ${fishyCount === 2 ? "two" : "three"} fish, red fish, ${
          fishyCount === 2 ? "blue" : "green"
        } fish`,
        `The fishy seem to have a sense of impending doom...`,
        `The fishy are swimming around aimlessly`,
        `The ${fishyCount} fishy seem to be having a staring contest`,
      ]);
    } else if (fishyCount <= 8) {
      return Chance().pickone([
        `It's a party, ${fishyCount} fishy showed up!`,
        `The fishy are excited about something... but you don't know what`,
        `1, 2, 3, ...${fishyCount} fishy!?`,
        `The fishy look happy! :)`,
        `Despite there only being ${fishyCount} fishy in the tank, they keep bumping into eachother`,
        `${fishyCount} fishy are engaged in a deep conversation... or sitting in silence, you don't speak fishy.`,
      ]);
    } else {
      return Chance().pickone([
        `Fishies mad x32`,
        `Wow! ${fishyCount} fishy fill the tank!`,
        `The tank is bursting with fish!`,
        `The fishy gather around the glass staring at you.`,
      ]);
    }
  }
}
