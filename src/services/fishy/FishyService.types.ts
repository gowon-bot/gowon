import { Chance } from "chance";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { chunkArray, shuffle } from "../../helpers";
import { Emoji } from "../../lib/emoji/Emoji";
import { Fishy, FishyRarities } from "./Fishy";

export interface FishyResult {
  fishy: Fishy;
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
  mostAbundantFish: Fishy;
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

  public render({ width, height }: AquariumDimensions, fishy: Fishy[]): string {
    const flattenedAquarium = this.createFlattenedAquarium(width, height);

    const filledAquarium = this.fillWithFishy(flattenedAquarium, fishy);

    const aquarium = this.unflatten(filledAquarium, width);

    const withWalls = this.addAquariumWalls(aquarium, width);

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

  private addAquariumWalls(aquarium: string[][], width: number): string[][] {
    const top: string[] = [
      Emoji.aquariumTopLeft,
      ...new Array<string>(width).fill(Emoji.aquariumTop),
      Emoji.aquariumTopRight,
    ];

    const bottom = this.generateAquariumBottom(width);

    const middle = aquarium.map((aRow) => [
      Emoji.aquariumLeft,
      ...aRow,
      Emoji.aquariumRight,
    ]);

    return [top, ...middle, bottom];
  }

  private generateAquariumBottom(width: number): string[] {
    const decorationCount = Chance().integer({ min: 0, max: 3 });
    const decorations: string[] = [];

    for (let i = 0; i < decorationCount; i++) {
      decorations.push(Chance().pickone(this.aquariumDecorations));
    }

    const floor = shuffle([
      ...decorations,
      ...new Array<string>(width - decorationCount).fill(Emoji.aquariumBottom),
    ]);

    return [Emoji.aquariumBottomLeft, ...floor, Emoji.aquariumBottomRight];
  }

  private renderAquarium(withWalls: string[][]): string {
    return withWalls.map((row) => row.join("")).join("\n");
  }
}
