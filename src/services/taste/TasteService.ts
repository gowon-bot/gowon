import { abs } from "mathjs";
import { calculatePercent } from "../../helpers/stats";
import { BaseService } from "../BaseService";
import { TopArtist } from "../LastFM/converters/TopTypes";
import { MirrorballRating } from "../mirrorball/MirrorballTypes";
import { ArtistPlaysPair, ArtistTaste, RatingPair } from "./TasteService.types";

export class TasteService extends BaseService {
  compatibility(percentage: string): string {
    const percentile = parseFloat(percentage);

    if (percentile > 90) {
      return "soulmates!";
    } else if (percentile > 50) {
      return "really high!";
    } else if (percentile > 30) {
      return "very high!";
    } else if (percentile > 20) {
      return "quite high!";
    } else if (percentile > 10) {
      return "great!";
    } else if (percentile > 5) {
      return "good";
    } else if (percentile > 1) {
      return "somewhat compatible";
    } else {
      return "tragic...";
    }
  }

  artistTaste(
    userOneArtists: TopArtist[],
    userTwoArtists: TopArtist[],
    amount: number
  ): ArtistTaste {
    const matchedArtists = userOneArtists
      .slice(0, amount)
      .reduce(this.matchArtist(userTwoArtists, amount), []);

    const sortedMatchedArtists = this.sortMatchedArtists(matchedArtists);

    return {
      percent: calculatePercent(
        matchedArtists.length,
        userOneArtists.slice(0, amount).length
      ),
      artists: sortedMatchedArtists,
    } as ArtistTaste;
  }

  // A rating threshold of 1 means half a star differences will be displayed
  ratingsTaste(
    userOneRatings: MirrorballRating[],
    userTwoRatings: MirrorballRating[],
    ratingThreshold = 1
  ) {
    const matchedRatings = userOneRatings.reduce(
      this.matchRating(userTwoRatings, ratingThreshold),
      []
    );

    return {
      percent: calculatePercent(matchedRatings.length, userOneRatings.length),
      ratings: matchedRatings,
    };
  }

  private matchArtist(
    userTwoArtists: TopArtist[],
    amount: number
  ): (acc: ArtistPlaysPair[], artist: TopArtist) => ArtistPlaysPair[] {
    return (acc, artist) => {
      const userTwoArtist = userTwoArtists
        .slice(0, amount)
        .find((a) => a.name === artist.name);

      if (userTwoArtist) {
        acc.push({
          name: artist.name,
          user1Plays: artist.userPlaycount,
          user2Plays: userTwoArtist.userPlaycount,
        });
      }

      return acc;
    };
  }

  private matchRating(
    userTwoRatings: MirrorballRating[],
    ratingThreshold: number
  ): (acc: RatingPair[], artist: MirrorballRating) => RatingPair[] {
    return (acc, rating) => {
      const userTwoRating = userTwoRatings.find(
        (r) =>
          r.rateYourMusicAlbum.rateYourMusicID ===
            rating.rateYourMusicAlbum.rateYourMusicID &&
          abs(rating.rating - r.rating) <= ratingThreshold
      );

      if (userTwoRating) {
        acc.push({ userOneRating: rating, userTwoRating });
      }

      return acc;
    };
  }

  private sortMatchedArtists(
    matchedArtists: ArtistPlaysPair[]
  ): ArtistPlaysPair[] {
    return matchedArtists.sort(
      (a, b) => b.user1Plays * b.user2Plays - a.user1Plays * a.user2Plays
    );
  }
}
