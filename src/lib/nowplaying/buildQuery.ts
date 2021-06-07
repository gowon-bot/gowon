import { DocumentNode, gql } from "@apollo/client/core";

const queryParts = ["artistPlays", "albumPlays", "albumRating"] as const;
export type QueryPartName = typeof queryParts[number];

export interface QueryPart {
  query: QueryPartName;
  variables: any;
}

export function isQueryPart(value: any): value is QueryPart {
  return value.query && value.variables;
}

const nowPlayingQuery = gql`
  query nowPlayingQuery(
    $artistPlays: Boolean!
    $albumPlays: Boolean!
    $albumRating: Boolean!
    $user: UserInput!
    $apSettings: ArtistPlaysSettings
    $lpSettings: AlbumPlaysSettings
    $lrAlbum: AlbumInput
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
      rating
      rateYourMusicAlbum {
        title
        artistName
      }
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

  let variables = {} as { [query: string]: any };

  for (const part of parts) {
    queryControls[part.query] = true;
    variables = Object.assign(variables, part.variables);
  }

  return {
    query: nowPlayingQuery,
    variables: Object.assign(queryControls, variables),
  };
}
