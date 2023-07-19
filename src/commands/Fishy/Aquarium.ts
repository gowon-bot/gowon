import { Chance } from "chance";
import { bold } from "../../helpers/discord";
import { emDash, quote } from "../../helpers/specialCharacters";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Emoji } from "../../lib/emoji/Emoji";
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

There be **${displayNumber(aquarium.size)} total fishy** in your aquarium.
${
  aquarium.size === 0
    ? ``
    : `The most abundant fish is ${bold(aquarium.mostAbundantFish.name)}.`
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
        `${Emoji.naan} Naan has scared away all the fishy!`,
        "🌫️ the fog has come for your fishy.",
        "Your fishy aren't around... they're probably up to no good...",
        "THE FISHY ARE IN YOUR WALLS",
      ]);
    } else if (fishyCount === 1) {
      const fishyFriend = fishy[0];

      return Chance().pickone([
        `Only a single ${fishyFriend.name} came out to see you!`,
        `A ${fishyFriend.name} is all alone in the tank, they must've missed the invite to the fishy party`,
        `A ${fishyFriend.name} seems to be the only fishy around`,
        `The sole ${fishyFriend.name} in the tank is staring at you.`,
        `${fishyFriend.name}: ${quote(
          "This aquarium is really clean and tidy."
        )}`,
        `${fishyFriend.name}: ${quote("I want to go home.")}`,
        `${fishyFriend.name}: ${quote("Is someone watching me?")}`,
        `A ${fishyFriend.name} has gained the power of levitation`,
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
        "The fishy seem a little crabby...",
        "The fishy are just hanging out",
        "The fishy seem to be playing hide and seak",
        "Your fishy look a little more sentient than yesterday...",
        `${quote(
          nonsense(Chance().integer({ min: 30, max: 60 }))
        )}\n\t${emDash} The Fishy`,
        "The fishy are contemplating the meaning of life",
      ]);
    } else if (fishyCount <= 8) {
      return Chance().pickone([
        `It's a party, ${fishyCount} fishy showed up!`,
        `The fishy are excited about something... but you don't know what`,
        `1, 2, 3, ...${fishyCount} fishy!?`,
        `The fishy look happy! :)`,
        `Despite there only being ${fishyCount} fishy in the tank, they keep bumping into eachother`,
        `${fishyCount} fishy are engaged in a deep conversation... or sitting in silence, you don't speak fishy.`,
        `The ${fishyCount} fishy are having a discussion... it seems a bit fishy`,
        "The fishy are scrobbling some fish themed music",
        "Your fishy are chanting in latin.",
        "\\*ominous fishy noises\\*",
        "Your fishy are hard at work doing something",
        "The fishy have become aware they are in a Discord bot. your time is limited.",
        "Your fishy have hacked the mainframe",
        "Your fishy are holding a prayer circle to get Leoni a legendary",
      ]);
    } else {
      return Chance().pickone([
        `Fishies mad x24`,
        `Wow! ${fishyCount} fishy fill the tank!`,
        `The tank is bursting with fish!`,
        `The fishy gather around the glass staring at you.`,
        `Your fishy are having a whale of a time!`,
        "WOOOOOO!!!! FISHY!!!!!",
        `Your fishy have opened a portal to escape \`${this.prefix}aquarium\`\n\nhaha just kidding they're only hanging out`,
      ]);
    }
  }
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";

function nonsense(length: number): string {
  var result = "";
  for (var i = 0; i < length; ++i) {
    result += characters[Math.floor(characters.length * Math.random())];
  }
  return result;
}
