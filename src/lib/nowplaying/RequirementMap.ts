import { CrownDisplay } from "../../services/dbservices/CrownsService";
import {
  IndexerAlbum,
  IndexerArtist,
  IndexerRateYourMusicAlbum,
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
  albumPlays: [{ album: IndexerAlbum; playcount: number }];
  artistPlays: [{ artist: IndexerArtist; playcount: number }];
  albumRating: [
    { rating: number; rateYourMusicAlbum: IndexerRateYourMusicAlbum }
  ];
};
