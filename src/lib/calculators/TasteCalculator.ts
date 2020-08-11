import { TopArtists } from "../../services/LastFMService.types";
import { calculatePercent } from "../../helpers/stats";
import { mean, sqrt } from "mathjs";

export interface TasteArtist {
  name: string;
  user1plays: number;
  user2plays: number;
}

export interface Taste {
  percent: string;
  artists: TasteArtist[];
}

export class TasteCalculator {
  userOneArtists: TopArtists;
  userTwoArtists: TopArtists;

  constructor(userOneArtists: TopArtists, userTwoArtists: TopArtists) {
    this.userOneArtists = userOneArtists;
    this.userTwoArtists = userTwoArtists;
  }

  sortMatchedArtists(matchedArtists: TasteArtist[]): TasteArtist[] {
    let topArtistsAverage = {
      userOne: mean(
        matchedArtists
          .sort((a, b) => a.user1plays - b.user1plays)
          .slice(0, 5)
          .map((a) => a.user1plays)
      ),
      userTwo: mean(
        matchedArtists
          .sort((a, b) => a.user2plays - b.user2plays)
          .slice(0, 5)
          .map((a) => a.user2plays)
      ),
    };

    return matchedArtists.sort(
      (a, b) =>
        (b.user1plays / topArtistsAverage.userOne) * 10 +
        sqrt(b.user1plays) -
        (a.user2plays / topArtistsAverage.userTwo) * 10 +
        sqrt(a.user2plays)
    );
  }

  calculate(): Taste {
    let matchedArtists = this.userOneArtists.artist.reduce((acc, artist) => {
      let userTwoArtist = this.userTwoArtists.artist.find(
        (a) => a.name === artist.name
      );
      if (userTwoArtist) {
        acc.push({
          name: artist.name,
          user1plays: artist.playcount.toInt(),
          user2plays: userTwoArtist.playcount.toInt(),
        });
      }

      return acc;
    }, [] as TasteArtist[]);

    matchedArtists = this.sortMatchedArtists(matchedArtists);

    return {
      percent: calculatePercent(
        matchedArtists.length,
        this.userOneArtists.artist.length
      ),
      artists: matchedArtists,
    } as Taste;
  }
}
