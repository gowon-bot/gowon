import { CrownDisplay } from "../../services/dbservices/CrownsService";
import {
  MirrorballAlbum,
  MirrorballArtist,
  MirrorballRating,
} from "../../services/mirrorball/MirrorballTypes";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import { AlbumCard } from "../../database/entity/cards/AlbumCard";

type ArtistRank = {
  rank: number;
  listeners: number;
};

export type RequirementMap = {
  // Lastfm data
  artistInfo: ArtistInfo;
  trackInfo: TrackInfo;

  // Gowon data
  artistCrown: CrownDisplay | undefined;
  albumCard: AlbumCard | undefined;

  // Mirrorball data
  albumPlays: [{ album: MirrorballAlbum; playcount: number }];
  artistPlays: [{ artist: MirrorballArtist; playcount: number }];
  albumRating: { ratings: [MirrorballRating] };
  globalArtistRank: ArtistRank;
  serverArtistRank: ArtistRank;
};
