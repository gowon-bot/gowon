import { calculatePercent } from "../../helpers/stats";
import { ConvertedTopArtist } from "../../services/LastFM/converters/TopTypes";

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
    private userOneArtists: ConvertedTopArtist[],
    private userTwoArtists: ConvertedTopArtist[],
    private artistAmount: number
  ) {}

  sortMatchedArtists(matchedArtists: TasteArtist[]): TasteArtist[] {
    return matchedArtists.sort(
      (a, b) => b.user1plays * b.user2plays - a.user1plays * a.user2plays
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
            user1plays: artist.userPlaycount,
            user2plays: userTwoArtist.userPlaycount,
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
