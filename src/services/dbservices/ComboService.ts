import { Combo } from "../../lib/calculators/ComboCalculator";
import { Combo as DBCombo } from "../../database/entity/Combo";
import { BaseService } from "../BaseService";
import { User } from "../../database/entity/User";
import { ILike, In, MoreThanOrEqual } from "typeorm";
import { displayNumber } from "../../lib/views/displays";
import { sqlLikeEscape } from "../../helpers/database";
import { GowonContext } from "../../lib/context/Context";

export class ComboService extends BaseService {
  public readonly threshold = 20;

  public shouldSaveCombo(combo: Combo): boolean {
    return (
      combo.artist.plays >= this.threshold ||
      combo.album.plays >= this.threshold ||
      combo.track.plays >= this.threshold
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
    let dbCombo = await this.getCombo(ctx, combo, user);

    if (!dbCombo) {
      dbCombo = await this.createCombo(ctx, combo, user);
    }

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

    const whereClause = artist
      ? { user, artistName: ILike(sqlLikeEscape(artist)) }
      : { user };

    return await DBCombo.find({
      where: [
        { ...whereClause, artistPlays: MoreThanOrEqual(this.threshold) },
        { ...whereClause, albumPlays: MoreThanOrEqual(this.threshold) },
        { ...whereClause, trackPlays: MoreThanOrEqual(this.threshold) },
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
