import { Chance } from "chance";
import { User } from "../../database/entity/User";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { FishyRarities, FishyRarityData } from "./Fishy";
import { FishyResult } from "./FishyService.types";
import { getFishyList } from "./fishyList";

type RarityPool = [FishyRarityData[], number[]];

export class FishyService extends BaseService {
  private rarityPool = Object.values(FishyRarities).reduce(
    (acc, r) =>
      [
        [...acc[0], r],
        [...acc[1], r.weight],
      ] as RarityPool,
    [[], []] as RarityPool
  );

  private chance = Chance();

  public fish(): FishyResult {
    const rarity = this.pickRarity();
    const fishyList = getFishyList(rarity);

    const fishy = this.chance.pickone(fishyList);
    const weight = fishy.pickWeight();

    return { fishy, weight };
  }

  public async saveFishy(
    ctx: GowonContext,
    fishyResult: FishyResult,
    user: User
  ): Promise<FishyCatch> {
    this.log(
      ctx,
      `Saving fishy ${fishyResult.fishy.name} (${fishyResult.weight}kg) for user with id ${user.id}`
    );

    const fishyCatch = FishyCatch.create({
      fisher: user,
      fishyId: fishyResult.fishy.id,
      weight: fishyResult.weight,
    });

    return await fishyCatch.save();
  }

  private pickRarity(): FishyRarityData {
    return this.chance.weighted(...this.rarityPool);
  }
}
