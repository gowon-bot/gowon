import { Chance } from "chance";
import { In, IsNull, Not } from "typeorm";
import { User } from "../../database/entity/User";
import { FishyCatch } from "../../database/entity/fishy/FishyCatch";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import { toInt } from "../../helpers/lastfm";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import { Fishy, FishyRarities, FishyRarityData } from "./Fishy";
import {
  Aquarium,
  FishyRarityBreakdown,
  FishyResult,
} from "./FishyService.types";
import { specialFishies } from "./fishy/special";
import { trash } from "./fishy/trash";
import { findFishy, getFishyList } from "./fishyList";

type RarityPool = [FishyRarityData[], number[]];

export class FishyService extends BaseService {
  private rarityPool: RarityPool = this.generateRarityPool();

  private chance = Chance();

  public async fish(fishyProfile: FishyProfile): Promise<FishyResult> {
    const rarity = this.pickRarity();
    const fishyList = getFishyList(rarity);

    const fishy = this.chance.pickone(fishyList);
    const weight = fishy.pickWeight();
    const isNew = await this.isFishyNewForUser(fishyProfile, fishy);

    return { fishy, weight, isNew };
  }

  public async saveFishy(
    ctx: GowonContext,
    fishyResult: FishyResult,
    profile: FishyProfile,
    gifter?: FishyProfile
  ): Promise<FishyCatch> {
    this.log(
      ctx,
      `Saving fishy ${fishyResult.fishy.name} (${fishyResult.weight}kg) for user with id ${profile.user.id}`
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

  public async countGiftsReceived(userId: number): Promise<number> {
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

  /**
   *
   * Returns a list of fishy ids that the user has caught
   */
  public async getCollection(fishyProfile: FishyProfile): Promise<string[]> {
    const collection = await FishyCatch.createQueryBuilder()
      .select('distinct "fishyId"')
      .where({ owner: { id: fishyProfile.user.id } })
      .getRawMany<{ fishyId: string }>();

    return collection.map((c) => c.fishyId);
  }

  public async getLastCatch(
    fishyProfile: FishyProfile
  ): Promise<FishyCatch | undefined> {
    return (
      (await FishyCatch.findOne({
        where: { owner: { id: fishyProfile.user.id } },
        order: { fishedAt: "DESC" },
      })) ?? undefined
    );
  }

  public async countFishy(
    fishyProfile: FishyProfile,
    fishy: Fishy
  ): Promise<number> {
    return await FishyCatch.countBy({
      owner: { id: fishyProfile.user.id },
      fishyId: fishy.id,
    });
  }

  public async rarityBreakdown(
    fishyProfile: FishyProfile
  ): Promise<FishyRarityBreakdown> {
    const results = await FishyCatch.createQueryBuilder()
      .where({
        owner: { id: fishyProfile.user.id },
      })
      .select('"fishyId"')
      .addSelect("count(*)", "count")
      .groupBy('"fishyId"')
      .getRawMany<{ fishyId: string; count: string }>();

    return results.reduce((acc, { fishyId, count }) => {
      const fishy = findFishy({ byID: fishyId })!;

      acc[fishy.rarity.key] = (acc[fishy.rarity.key] || 0) + toInt(count);

      return acc;
    }, {} as Record<string, number>) as FishyRarityBreakdown;
  }

  private pickRarity(): FishyRarityData {
    return this.chance.weighted(...this.rarityPool);
  }

  private async getRandomFishiesAndCount(
    profile: FishyProfile,
    take: number
  ): Promise<[FishyCatch[], number]> {
    const result = await FishyCatch.createQueryBuilder()
      .where({
        owner: { id: profile.user.id },
        fishyId: Not(In(trash.map((t) => t.id))),
      })
      .orderBy("RANDOM()")
      .limit(take || 1)
      .getManyAndCount();

    return take === 0 ? [[], result[1]] : result;
  }

  private async getMostAbundantFish(
    fishyProfile: FishyProfile
  ): Promise<Fishy> {
    const result = await FishyCatch.createQueryBuilder()
      .select('"fishyId"')
      .addSelect("count(*)", "count")
      .groupBy('"fishyId"')
      .orderBy("count(*)", "DESC")
      .where({ owner: { id: fishyProfile.user.id } })
      .limit(1)
      .getRawOne<{ fishyId: string }>();

    return findFishy({ byID: result?.fishyId! })!;
  }

  private async isFishyNewForUser(
    fishyProfile: FishyProfile,
    fishy: Fishy
  ): Promise<boolean> {
    const fishyCount = await FishyCatch.countBy({
      owner: { id: fishyProfile.user.id },
      fishyId: fishy.id,
    });

    return fishyCount === 0;
  }

  private generateRarityPool(): RarityPool {
    const specialRarities = Object.values(
      specialFishies.reduce((acc, f) => {
        acc[f.rarity.name] = f.rarity;
        return acc;
      }, {} as Record<string, FishyRarityData>)
    );

    const rarities = Object.values(FishyRarities).concat(specialRarities);

    return [rarities, rarities.map((r) => r.weight)];
  }
}
