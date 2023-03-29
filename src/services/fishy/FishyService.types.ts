import { Chance } from "chance";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { chunkArray, shuffle } from "../../helpers";
import { Emoji } from "../../lib/emoji/Emoji";
import { Fishy } from "./Fishy";

export interface FishyResult {
  fishy: Fishy;
  weight: number;
}

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

  constructor() {}

  public render({ width, height }: AquariumDimensions, fishy: Fishy[]): string {
    const flattenedAquarium = this.createFlattenedAquarium(width, height);

    const filledAquarium = this.fillWithFishy(flattenedAquarium, fishy);

    const aquarium = this.unflatten(filledAquarium, height);

    const withWalls = this.addAquariumWalls(aquarium, width);

    return this.renderAquarium(withWalls);
  }

  private createFlattenedAquarium(width: number, height: number): string[] {
    return new Array<string>().fill(Emoji.aquariumWater, 0, width * height);
  }

  private fillWithFishy(flattenedAquarium: string[], fishy: Fishy[]): string[] {
    return shuffle(
      flattenedAquarium
        .slice(0, fishy.length)
        .concat(fishy.map((f) => f.emojiInWater))
    );
  }

  private unflatten(flattenedAquarium: string[], height: number): string[][] {
    return chunkArray(flattenedAquarium, height);
  }

  private addAquariumWalls(aquarium: string[][], width: number): string[][] {
    const top: string[] = [
      Emoji.aquariumTopLeft,
      ...new Array<string>().fill(Emoji.aquariumTop, 0, width),
    ];

    const bottom = this.generateAquariumBottom(width + 2);

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
      ...new Array<string>().fill(
        Emoji.aquariumBottom,
        0,
        width - decorationCount
      ),
    ]);

    return [Emoji.aquariumBottomLeft, ...floor, Emoji.aquariumBottomRight];
  }

  private renderAquarium(withWalls: string[][]): string {
    return withWalls.map((row) => row.join("")).join("\n");
  }
}
