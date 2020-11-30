import { fromUnixTime } from "date-fns";
import { Scrobble } from "../../database/entity/Scrobble";
import { BaseService } from "../BaseService";
import { ExtendedTrack } from "../LastFM/LastFMService.types";

export class CachedScrobblesService extends BaseService {
  async cache(tracks: ExtendedTrack[]) {
    tracks = tracks.filter((t) => !t["@attr"]?.nowplaying);

    let cachedScrobbles = tracks.map((track) => {
      const scrobbledAt = fromUnixTime(track.date.uts.toInt());

      return Scrobble.create({
        title: track.name,
        artist: track.artist.name,
        album: track.album["#text"] || undefined,
        scrobbledAt,
      });
    });

    await Scrobble.save(cachedScrobbles);
  }
}
