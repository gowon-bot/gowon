import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import {
  AlbumInfo,
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import { CrownDisplay } from "../../services/dbservices/crowns/CrownsService.types";
import {
  LilacAlbumCount,
  LilacArtistCount,
  LilacRating,
  LilacWhoKnowsArtistRank,
} from "../../services/lilac/LilacAPIService.types";
import { Combo } from "../calculators/ComboCalculator";

export type DependencyMap = {
  // Lastfm data
  artistInfo: ArtistInfo;
  trackInfo: TrackInfo;
  albumInfo?: AlbumInfo;

  // Gowon data
  artistCrown: CrownDisplay | undefined;
  albumCard: AlbumCard | undefined;
  fishyProfile: FishyProfile | undefined;
  cachedLovedTrack: CachedLovedTrack | undefined;
  combo: Combo | undefined;

  // Lilac data
  albumCount: LilacAlbumCount | undefined;
  artistCount: LilacArtistCount | undefined;
  albumRating: LilacRating | undefined;
  globalArtistRank: Pick<LilacWhoKnowsArtistRank, "rank" | "totalListeners">;
  serverArtistRank: Pick<LilacWhoKnowsArtistRank, "rank" | "totalListeners">;
};
