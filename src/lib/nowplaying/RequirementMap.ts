import { CrownDisplay } from "../../services/dbservices/CrownsService";
import {
  MirrorballAlbum,
  MirrorballArtist,
  MirrorballRateYourMusicAlbum,
} from "../../services/indexing/IndexingTypes";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";

export type RequirementMap = {
  // Lastfm data
  artistInfo: ArtistInfo;
  trackInfo: TrackInfo;

  // Gowon data
  artistCrown: CrownDisplay | undefined;

  // Indexer data
  albumPlays: [{ album: MirrorballAlbum; playcount: number }];
  artistPlays: [{ artist: MirrorballArtist; playcount: number }];
  albumRating: [
    { rating: number; rateYourMusicAlbum: MirrorballRateYourMusicAlbum }
  ];
};
