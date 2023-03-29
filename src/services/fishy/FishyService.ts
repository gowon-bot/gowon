import { Chance } from "chance";
import { IsNull, Not } from "typeorm";
import { User } from "../../database/entity/User";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { Fishy, FishyRarities, FishyRarityData } from "./Fishy";
import { Aquarium, FishyResult } from "./FishyService.types";
import { findFishy, getFishyList } from "./fishyList";

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
    profile: FishyProfile,
    gifter?: FishyProfile
  ): Promise<FishyCatch> {
    this.log(
      ctx,
      `Saving fishy ${fishyResult.fishy.name} (${fishyResult.weight}kg) for user with id ${profile.id}`
    );

    const fishyCatch = FishyCatch.create({
      owner: profile.user,
      gifter: gifter?.user,
      fishyId: fishyResult.fishy.id,
      weight: fishyResult.weight,
    });

    profile.timesFished++;
    profile.totalWeight += fishyResult.weight;

    await profile.save();
    return await fishyCatch.save();
  }

  async getFishyProfile(user: User, autoCreate: true): Promise<FishyProfile>;
  async getFishyProfile(
    user: User,
    autoCreate: false | boolean
  ): Promise<FishyProfile | undefined>;
  public async getFishyProfile(
    user: User,
    autoCreate: boolean = false
  ): Promise<FishyProfile | undefined> {
    const profile = await FishyProfile.findOneBy({
      user: { id: user.id },
    });

    if (!profile && autoCreate) {
      const newProfile = FishyProfile.create({ user });

      return await newProfile.save();
    }

    return profile ?? undefined;
  }

  public async updateCooldown(
    fishyProfile: FishyProfile
  ): Promise<FishyProfile> {
    fishyProfile.lastFished = new Date();
    return await fishyProfile.save();
  }

  public async countGiftsGiven(userId: number): Promise<number> {
    return await FishyCatch.countBy({ gifter: { id: userId } });
  }

  public async countGiftsRecieved(userId: number): Promise<number> {
    return await FishyCatch.countBy({
      owner: { id: userId },
      gifter: Not(IsNull()),
    });
  }

  public async getBiggestFishy(
    userId: number
  ): Promise<FishyCatch | undefined> {
    const fishy = await FishyCatch.find({
      where: { owner: { id: userId } },
      order: {
        weight: "DESC",
      },
      take: 1,
    });

    return fishy[0];
  }

  public async getAquarium(fishyProfile: FishyProfile): Promise<Aquarium> {
    const fishyCount = Chance().integer({ min: 0, max: 10 });

    const [fishies, size] = await this.getRandomFishiesAndCount(
      fishyProfile,
      fishyCount
    );

    const mostAbundantFish = await this.getMostAbundantFish(fishyProfile);

    return { fishies, mostAbundantFish, size };
  }

  private pickRarity(): FishyRarityData {
    return this.chance.weighted(...this.rarityPool);
  }

  private async getRandomFishiesAndCount(
    profile: FishyProfile,
    take: number
  ): Promise<[FishyCatch[], number]> {
    return await FishyCatch.createQueryBuilder()
      .where({
        owner: { id: profile.user.id },
      })
      .orderBy("RANDOM()")
      .limit(take)
      .getManyAndCount();
  }

  private async getMostAbundantFish(
    fishyProfile: FishyProfile
  ): Promise<Fishy> {
    const mostAbundantFishId = await FishyCatch.createQueryBuilder()
      .select("fishyId")
      .groupBy("fishyId")
      .orderBy("fishyId")
      .where({ owner: { id: fishyProfile.user.id } })
      .limit(1)
      .getRawOne<string>();

    return findFishy({ byID: mostAbundantFishId! })!;
  }
}
