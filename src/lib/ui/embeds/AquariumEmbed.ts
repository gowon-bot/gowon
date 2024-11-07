import { Chance } from "chance";
import { chunkArray, shuffle } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { emDash, quote } from "../../../helpers/specialCharacters";
import { Fishy, FishyDisplayMode } from "../../../services/fishy/Fishy";
import {
  Aquarium,
  AquariumDimensions,
} from "../../../services/fishy/FishyService.types";
import { Emoji } from "../../emoji/Emoji";
import { displayNumber } from "../displays";
import { EmbedView } from "../views/EmbedView";
import { View } from "../views/View";

export class AquariumEmbed extends View {
  private aquarium!: Aquarium;
  private readonly width: number = 8;
  private readonly height: number = 5;

  private readonly aquariumDecorations: string[] = [
    Emoji.aquariumCastle,
    Emoji.aquariumCoral,
    Emoji.aquariumMoyai,
    Emoji.aquariumPlant,
    Emoji.aquariumRock,
  ];

  private readonly bubbles: string[] = [
    Emoji.bubbles1,
    Emoji.bubbles2,
    Emoji.bubbles3,
  ];

  constructor(private baseEmbed: EmbedView) {
    super({});
  }

  setAquarium(aquarium: Aquarium): this {
    this.aquarium = aquarium;
    return this;
  }

  asDiscordSendable(): EmbedView {
    const fishies = this.aquarium.fishies.map((f) => f.fishy);

    const tank = this.renderTank(
      { width: this.width, height: this.height },
      fishies
    );
    const message = this.getAquariumMessage(fishies);

    return this.baseEmbed.setDescription(`
_${message}_
      
${tank}
      
There be **${displayNumber(this.aquarium.size)} total fishy** in your aquarium.
      ${
        this.aquarium.size === 0
          ? ``
          : `The most abundant fish is ${bold(
              this.aquarium.mostAbundantFish.name
            )}.`
      }
      `);
  }

  private renderTank(
    { width, height }: AquariumDimensions,
    fishy: Fishy[]
  ): string {
    const flattenedAquarium = this.createFlattenedAquarium(width, height);

    const { floatingFishy, bottomFishy } = this.separateFishy(fishy);

    const filledAquarium = this.fillWithFishy(flattenedAquarium, floatingFishy);

    const aquarium = this.unflatten(filledAquarium, width);

    const withWalls = this.addAquariumWalls(aquarium, width, bottomFishy);

    return this.renderAquarium(withWalls);
  }

  private createFlattenedAquarium(width: number, height: number): string[] {
    const bubblesCount = Chance().integer({ min: 0, max: 5 });

    const bubbles = [];

    for (let i = 0; i < bubblesCount; i++) {
      bubbles.push(Chance().pickone(this.bubbles));
    }

    const water = new Array<string>(width * height - bubblesCount).fill(
      Emoji.aquariumWater
    );

    return shuffle([...water, ...bubbles]);
  }

  private fillWithFishy(flattenedAquarium: string[], fishy: Fishy[]): string[] {
    return shuffle(
      flattenedAquarium
        .slice(fishy.length, flattenedAquarium.length)
        .concat(fishy.map((f) => f.emojiInWater))
    );
  }

  private unflatten(flattenedAquarium: string[], width: number): string[][] {
    return chunkArray(flattenedAquarium, width);
  }

  private addAquariumWalls(
    aquarium: string[][],
    width: number,
    bottomFishy: Fishy[]
  ): string[][] {
    const top: string[] = [
      Emoji.aquariumTopLeft,
      ...new Array<string>(width).fill(Emoji.aquariumTop),
      Emoji.aquariumTopRight,
    ];

    const bottom = this.generateAquariumBottom(width, bottomFishy);

    const middle = aquarium.map((aRow) => [
      Emoji.aquariumLeft,
      ...aRow,
      Emoji.aquariumRight,
    ]);

    return [top, ...middle, bottom];
  }

  private generateAquariumBottom(
    width: number,
    bottomFishy: Fishy[]
  ): string[] {
    const decorations = this.getAquariumDecorations(bottomFishy);

    const floor = shuffle([
      ...decorations,
      ...new Array<string>(width - decorations.length).fill(
        Emoji.aquariumBottom
      ),
    ]);

    return [Emoji.aquariumBottomLeft, ...floor, Emoji.aquariumBottomRight];
  }

  private renderAquarium(withWalls: string[][]): string {
    return withWalls.map((row) => row.join("")).join("\n");
  }

  private separateFishy(fishy: Fishy[]): {
    floatingFishy: Fishy[];
    bottomFishy: Fishy[];
  } {
    return fishy.reduce(
      (acc, fishy) => {
        if (fishy.displayMode === FishyDisplayMode.Floating) {
          acc.floatingFishy.push(fishy);
        } else if (fishy.displayMode === FishyDisplayMode.Bottom) {
          acc.bottomFishy.push(fishy);
        }

        return acc;
      },
      { floatingFishy: [] as Fishy[], bottomFishy: [] as Fishy[] }
    );
  }

  private getAquariumDecorations(bottomFishy: Fishy[]): string[] {
    const decorationCount = Chance().integer({ min: 0, max: 3 });

    const possibleDecorations = [
      ...bottomFishy.map((f) => f.emojiInWater),
      ...shuffle(this.aquariumDecorations),
    ];

    return possibleDecorations.slice(
      0,
      Math.max(decorationCount, bottomFishy.length)
    );
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
        "The fishy are trying to play chess, but the pieces keep floating away",
        "The fishy want the day off and have declared today a national holiday",
        "The fishy are busy right now, please hold *hold music*",
        "The fishy are exchanging tiny pebbles as tokens of affection.",
      ]);
    } else if (fishyCount <= 8) {
      return Chance().pickone([
        `It's a party, ${fishyCount} fishy showed up!`,
        `The fishy are excited about something... but you don't know what`,
        `1, 2, 3, ...${fishyCount} fishy!?`,
        `The fishy look happy! :)`,
        `Despite there only being ${fishyCount} fishy in the tank, they keep bumping into eachother`,
        `${fishyCount} fishy are engaged in a deep conversation... or sitting in silence, you don't speak fishy`,
        `The ${fishyCount} fishy are having a discussion... it seems a bit fishy`,
        "The fishy are scrobbling some fish themed music",
        "Your fishy are chanting in latin.",
        "\\*ominous fishy noises\\*",
        "Your fishy are hard at work doing something",
        "The fishy have become aware they are in a Discord bot. your time is limited.",
        "Your fishy have hacked the mainframe",
        "Your fishy are having a heated debate about food... again",
        `The fishy are starting a multilevel marketing scheme ${emDash} want to buy a pyramidfish?`,
        "The fishy are pondering the existence of the 'other side' of the glass.",
      ]);
    } else {
      return Chance().pickone([
        `Fishies mad x24`,
        `Wow! ${fishyCount} fishy fill the tank!`,
        `The tank is bursting with fish!`,
        `The fishy gather around the glass staring at you.`,
        `Your fishy are having a whale of a time!`,
        "WOOOOOO!!!! FISHY!!!!!",
        "Your fishy have opened a portal to escape the aquarium.\n\nhaha just kidding they're only hanging out",
        "Your fishy are dancing to the rhythm of the bubbles!",
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
