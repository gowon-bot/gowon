import { DocumentNode, gql } from "@apollo/client/core";

const queryParts = [
  "artistPlays",
  "albumPlays",
  "albumRating",
  "globalArtistRank",
  "serverArtistRank",
] as const;
export type QueryPartName = (typeof queryParts)[number];

export interface QueryPart {
  query: QueryPartName;
  variables: any;
}

export function isQueryPart(value: any): value is QueryPart {
  return value.query && value.variables;
}

// Some variables must be defined, so these are defaults
const startingVariables = {
  arArtist: {},
};

const nowPlayingQuery = gql`
  query nowPlayingQuery(
    $artistPlays: Boolean!
    $albumPlays: Boolean!
    $albumRating: Boolean!
    $globalArtistRank: Boolean!
    $serverArtistRank: Boolean!
    $user: UserInput!
    $apSettings: ArtistPlaysSettings
    $lpSettings: AlbumPlaysSettings
    $lrAlbum: AlbumInput
    $arArtist: ArtistInput!
    $serverID: String
  ) {
    artistPlays: artistPlays(user: $user, settings: $apSettings)
      @include(if: $artistPlays) {
      artist {
        name
      }
      playcount
    }

    albumPlays: albumPlays(user: $user, settings: $lpSettings)
      @include(if: $albumPlays) {
      album {
        name
        artist {
          name
        }
      }
      playcount
    }

    albumRating: ratings(
      settings: { user: $user, album: $lrAlbum, pageInput: { limit: 1 } }
    ) @include(if: $albumRating) {
      ratings {
        rating
        rateYourMusicAlbum {
          title
          artistName
        }
      }
    }

    globalArtistRank: artistRank(artist: $arArtist, userInput: $user)
      @include(if: $globalArtistRank) {
      rank
      listeners
    }

    serverArtistRank: artistRank(
      artist: $arArtist
      userInput: $user
      serverID: $serverID
    ) @include(if: $serverArtistRank) {
      rank
      listeners
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
