import { MirrorballRating } from "../mirrorball/MirrorballTypes";

// Artists
export interface ArtistPlaysPair {
  name: string;
  user1Plays: number;
  user2Plays: number;
}

export interface ArtistTaste {
  percent: string;
  artists: ArtistPlaysPair[];
}

// Ratings
export interface RatingPair {
  userOneRating: MirrorballRating;
  userTwoRating: MirrorballRating;
}

export interface RatingsTaste {
  percent: string;
  ratings: RatingPair[];
}
