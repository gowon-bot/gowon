import { ILike, In, MoreThanOrEqual } from "typeorm";
import { Combo as DBCombo } from "../../database/entity/Combo";
import { User } from "../../database/entity/User";
import { sqlLikeEscape } from "../../helpers/database";
import { toInt } from "../../helpers/lastFM";
import { Combo } from "../../lib/calculators/ComboCalculator";
import { GowonContext } from "../../lib/context/Context";
import { SettingsService } from "../../lib/settings/SettingsService";
import { displayNumber } from "../../lib/views/displays";
import { BaseService } from "../BaseService";
import { GowonService } from "../GowonService";
import { ServiceRegistry } from "../ServicesRegistry";

export class ComboService extends BaseService {
  public static readonly defaultComboThreshold = 20;

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  private get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  public getThreshold(ctx: GowonContext): number {
    const thresholdString = this.settingsService.get("comboSaveThreshold", {
      userID: ctx.author.id,
    });

    if (!thresholdString) {
      return this.gowonService.constants.defaultComboThreshold;
    } else return toInt(thresholdString);
  }

  public shouldSaveCombo(ctx: GowonContext, combo: Combo): boolean {
    const threshold = this.getThreshold(ctx);

    return (
      combo.artist.plays >= threshold ||
      combo.album.plays >= threshold ||
      combo.track.plays >= threshold
    );
  }

  async saveCombo(
    ctx: GowonContext,
    combo: Combo,
    user: User
  ): Promise<DBCombo> {
    this.log(
      ctx,
      `Saving combo of ${combo.artist.plays} for user ${user.discordID}`
    );
    const dbCombo =
      (await this.getCombo(ctx, combo, user)) ||
      (await this.createCombo(ctx, combo, user));

    dbCombo.artistPlays = combo.artist.plays || undefined;
    dbCombo.albumPlays = combo.album.plays || undefined;
    dbCombo.trackPlays = combo.track.plays || undefined;
    dbCombo.lastScrobble = combo.lastScrobble.scrobbledAt;
    dbCombo.trackName =
      combo.track.plays > 1 ? combo.lastScrobble.name : undefined;
    dbCombo.albumName =
      combo.album.plays > 1 ? combo.lastScrobble.album : undefined;

    return await dbCombo.save();
  }

  async getCombo(
    ctx: GowonContext,
    combo: Combo,
    user: User
  ): Promise<DBCombo | undefined> {
    this.log(
      ctx,
      `Getting combo of ${combo.artist.plays} for user ${user.discordID}`
    );

    return await DBCombo.findOne({
      user,
      firstScrobble: combo.firstScrobble.scrobbledAt,
    });
  }

  async createCombo(
    ctx: GowonContext,
    combo: Combo,
    user: User
  ): Promise<DBCombo> {
    this.log(
      ctx,
      `Creating combo of ${combo.artist.plays} for user ${user.discordID}`
    );
    const dbCombo = DBCombo.create({
      user,

      artistPlays: combo.artist.plays,
      artistName: combo.artistName,

      albumPlays: combo.album.plays,
      albumName: combo.albumName,

      trackPlays: combo.track.plays,
      trackName: combo.trackName,

      firstScrobble: combo.firstScrobble.scrobbledAt,
      lastScrobble: combo.lastScrobble.scrobbledAt,
    });

    return await dbCombo.save();
  }

  async listCombos(
    ctx: GowonContext,
    user: User,
    artist?: string
  ): Promise<DBCombo[]> {
    this.log(ctx, `Listing combos for user ${user.discordID}`);

    const threshold = this.getThreshold(ctx);

    const whereClause = artist
      ? { user, artistName: ILike(sqlLikeEscape(artist)) }
      : { user };

    return await DBCombo.find({
      where: [
        { ...whereClause, artistPlays: MoreThanOrEqual(threshold) },
        { ...whereClause, albumPlays: MoreThanOrEqual(threshold) },
        { ...whereClause, trackPlays: MoreThanOrEqual(threshold) },
      ],
      order: { artistPlays: "DESC", albumPlays: "DESC", trackPlays: "DESC" },
    });
  }

  async listCombosForUsers(
    ctx: GowonContext,
    userIDs: string[],
    artist?: string
  ): Promise<DBCombo[]> {
    this.log(
      ctx,
      `Listing combos for ${displayNumber(userIDs.length, "user")}`
    );
    const users = await User.find({ discordID: In(userIDs) });

    const user = In(users.map((u) => u.id));

    return await DBCombo.find({
      where: artist
        ? { user, artistName: ILike(sqlLikeEscape(artist)) }
        : { user },
      order: { artistPlays: "DESC", albumPlays: "DESC", trackPlays: "DESC" },
    });
  }
}
