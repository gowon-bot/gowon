import { DocumentNode, gql } from "@apollo/client/core";
import { SimpleMap } from "../../helpers/types";

export enum QueryPartName {
  ArtistCount = "artistCount",
  AlbumCount = "albumCount",
  AlbumRating = "albumRating",
  AmbiguousTrackCount = "ambiguousTrackCount",
  GlobalArtistRank = "globalArtistRank",
  ServerArtistRank = "serverArtistRank",
}

const queryParts = Object.values(QueryPartName);

export interface QueryPart<T = any, TransformClass = any> {
  query: QueryPartName;
  variables: SimpleMap;
  transformer?: (data: T) => TransformClass;
}

export function isQueryPart(value: any): value is QueryPart {
  return value.query && value.variables;
}

// Some variables must be defined, so these are defaults
const startingVariables = {
  arArtist: {},
  user: {},
};

const nowPlayingQuery = gql`
  query nowPlayingQuery(
    $artistCount: Boolean!
    $albumCount: Boolean!
    $ambiguousTrackCount: Boolean!
    $albumRating: Boolean!
    $globalArtistRank: Boolean!
    $serverArtistRank: Boolean!

    $user: UserInput!
    $acFilters: ArtistCountsFilters
    $lcFilters: AlbumCountsFilters
    $atcFilters: TrackCountsFilters
    $lrFilters: RatingsFilters
    $arArtist: ArtistInput!
    $guildID: String
  ) {
    ${QueryPartName.ArtistCount}: artistCounts(filters: $acFilters) @include(if: $artistCount) {
      artistCounts {
        artist {
          name
        }

        playcount
        firstScrobbled
        lastScrobbled
      }
    }

    ${QueryPartName.AlbumCount}: albumCounts(filters: $lcFilters) @include(if: $albumCount) {
      albumCounts {
        album {
          name
          artist {
            name
          }
        }

        playcount
        firstScrobbled
        lastScrobbled
      }
    }

    ${QueryPartName.AmbiguousTrackCount}: ambiguousTrackCounts(
      filters: $atcFilters
    ) @include(if: $ambiguousTrackCount) {
      trackCounts {
        playcount
        firstScrobbled
        lastScrobbled

        track {
          name
          artist {
            name
          }
        }
      }
    }


    ${QueryPartName.AlbumRating}: ratings(filters: $lrFilters) @include(if: $albumRating) {
      ratings {
        rating
        rateYourMusicAlbum {
          title
          artistName
        }
      }
    }

    ${QueryPartName.GlobalArtistRank}: whoKnowsArtistRank(artist: $arArtist, user: $user)
      @include(if: $globalArtistRank) {
      rank
      totalListeners
    }

    ${QueryPartName.ServerArtistRank}: whoKnowsArtistRank(
      artist: $arArtist
      user: $user
      settings: { guildID: $guildID }
    ) @include(if: $serverArtistRank) {
      rank
      totalListeners
    }
  }
`;

export function buildQuery(parts: QueryPart[]): {
  query: DocumentNode;
  variables: any;
} {
  const queryControls = queryParts.reduce((acc, part) => {
    acc[part] = false;

    return acc;
  }, {} as { [query: string]: boolean });

  let variables = startingVariables as { [query: string]: any };

  for (const part of parts) {
    queryControls[part.query] = true;
    variables = Object.assign(variables, part.variables);
  }

  return {
    query: nowPlayingQuery,
    variables: Object.assign(queryControls, variables),
  };
}
