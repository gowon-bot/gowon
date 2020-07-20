import { TopArtists } from "../services/LastFMService.types";
import { calculatePercent } from "./stats";

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

    return {
      percent: calculatePercent(
        matchedArtists.length,
        this.userOneArtists.artist.length
      ),
      artists: matchedArtists,
    } as Taste;
  }
}
