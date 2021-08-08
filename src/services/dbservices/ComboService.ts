import { Combo } from "../../lib/calculators/ComboCalculator";
import { Combo as DBCombo } from "../../database/entity/Combo";
import { BaseService } from "../BaseService";
import { User } from "../../database/entity/User";

export class ComboService extends BaseService {
  async saveCombo(combo: Combo, user: User): Promise<DBCombo> {
    let dbCombo = await this.getCombo(combo, user);

    if (!dbCombo) {
      dbCombo = await this.createCombo(combo, user);
    }

    dbCombo.artistPlays = combo.artist.plays || undefined;
    dbCombo.albumPlays = combo.album.plays || undefined;
    dbCombo.trackPlays = combo.track.plays || undefined;
    dbCombo.lastScrobble = combo.lastScrobble.scrobbledAt;

    return await dbCombo.save();
  }

  async getCombo(combo: Combo, user: User): Promise<DBCombo | undefined> {
    return await DBCombo.findOne({
      user,
      firstScrobble: combo.firstScrobble.scrobbledAt,
    });
  }

  async createCombo(combo: Combo, user: User): Promise<DBCombo> {
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

  async listCombos(user: User): Promise<DBCombo[]> {
    return await DBCombo.find({
      where: { user },
      order: { artistPlays: "DESC", albumPlays: "DESC", trackPlays: "DESC" },
    });
  }
}
