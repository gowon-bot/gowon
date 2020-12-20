import { TopArtist } from "../../services/LastFM/LastFMService.types";
import { calculatePercent } from "../../helpers/stats";
import { mean } from "mathjs";

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
  constructor(
    private userOneArtists: TopArtist[],
    private userTwoArtists: TopArtist[],
    private artistAmount: number
  ) {}

  sortMatchedArtists(matchedArtists: TasteArtist[]): TasteArtist[] {
    let userOneMatchedArtists = matchedArtists
      .sort((a, b) => a.user1plays - b.user1plays)
      .slice(0, 5)
      .map((a) => a.user1plays);
    let userTwoMatchedArtists = matchedArtists
      .sort((a, b) => a.user2plays - b.user2plays)
      .slice(0, 5)
      .map((a) => a.user2plays);

    let topArtistsAverage = {
      userOne: userOneMatchedArtists.length ? mean(userOneMatchedArtists) : 0,
      userTwo: userTwoMatchedArtists.length ? mean(userTwoMatchedArtists) : 0,
    };

    return matchedArtists.sort(
      (a, b) =>
        (b.user1plays + b.user2plays) *
          (b.user1plays / topArtistsAverage.userOne) -
        (a.user1plays + a.user2plays) *
          (a.user1plays / topArtistsAverage.userOne)
    );
  }

  calculate(): Taste {
    let matchedArtists = this.userOneArtists
      .slice(0, this.artistAmount)
      .reduce((acc, artist) => {
        let userTwoArtist = this.userTwoArtists
          .slice(0, this.artistAmount)
          .find((a) => a.name === artist.name);
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
        this.userOneArtists.slice(0, this.artistAmount).length
      ),
      artists: matchedArtists,
    } as Taste;
  }
}
