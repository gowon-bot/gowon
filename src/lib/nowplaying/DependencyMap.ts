import { CachedLovedTrack } from "../../database/entity/CachedLovedTrack";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";
import { FishyProfile } from "../../database/entity/fishy/FishyProfile";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import { CrownDisplay } from "../../services/dbservices/crowns/CrownsService.types";
import {
  MirrorballAlbum,
  MirrorballArtist,
  MirrorballRating,
} from "../../services/mirrorball/MirrorballTypes";
import { Combo } from "../calculators/ComboCalculator";

type ArtistRank = {
  rank: number;
  listeners: number;
};

export type DependencyMap = {
  // Lastfm data
  artistInfo: ArtistInfo;
  trackInfo: TrackInfo;

  // Gowon data
  artistCrown: CrownDisplay | undefined;
  albumCard: AlbumCard | undefined;
  fishyProfile: FishyProfile | undefined;
  cachedLovedTrack: CachedLovedTrack | undefined;
  combo: Combo | undefined;

  // Mirrorball data
  albumPlays: [{ album: MirrorballAlbum; playcount: number }];
  artistPlays: [{ artist: MirrorballArtist; playcount: number }];
  albumRating: { ratings: [MirrorballRating] };
  globalArtistRank: ArtistRank;
  serverArtistRank: ArtistRank;
};
