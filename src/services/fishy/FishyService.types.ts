import { Chance } from "chance";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { chunkArray, shuffle } from "../../helpers";
import { Emoji } from "../../lib/emoji/Emoji";
import { BaseFishy, FishyDisplayMode } from "./classes/BaseFishy";
import { FishyRarities } from "./classes/Fishy";

export interface FishyResult {
  fishy: BaseFishy;
  weight: number;
  isNew: boolean;
}

export type FishyRarityBreakdown = {
  [k in keyof typeof FishyRarities]: number;
};

export interface AquariumDimensions {
  width: number;
  height: number;
}

export interface Aquarium {
  fishies: FishyCatch[];
  size: number;
  mostAbundantFish: BaseFishy;
}

export class AquariumDisplay {
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

  constructor() {}

  public render(
    { width, height }: AquariumDimensions,
    fishy: BaseFishy[]
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

  private fillWithFishy(
    flattenedAquarium: string[],
    fishy: BaseFishy[]
  ): string[] {
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
    bottomFishy: BaseFishy[]
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
    bottomFishy: BaseFishy[]
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

  private separateFishy(fishy: BaseFishy[]): {
    floatingFishy: BaseFishy[];
    bottomFishy: BaseFishy[];
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
      { floatingFishy: [] as BaseFishy[], bottomFishy: [] as BaseFishy[] }
    );
  }

  private getAquariumDecorations(bottomFishy: BaseFishy[]): string[] {
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
}
