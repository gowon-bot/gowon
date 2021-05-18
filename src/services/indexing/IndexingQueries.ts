import { gql } from "@apollo/client/core";

export type IndexingQuery = keyof typeof IndexingQueries;

export function isIndexingQuery(
  query: Uppercase<string>
): query is IndexingQuery {
  return Object.keys(IndexingQueries).includes(query);
}

export const IndexingQueries = {
  TEST: gql`
    query testQuery {
      test
    }
  `,

  FULL_INDEX: gql`
    mutation indexUser($username: String!) {
      indexUser(username: $username) {
        success
        token
      }
    }
  `,

  USER_TOP_ARTISTS: gql`
    query userTopArtists($username: String!) {
      userTopArtists(username: $username)
    }
  `,

  WHO_KNOWS_ARTIST: gql`
    query whoKnowsArtist($artist: String!) {
      whoKnows(artist: $artist) {
        artist {
          name
        }
        users {
          playcount
          user {
            lastFMUsername
          }
        }
      }
    }
  `,

  UPDATE: gql`
    mutation updateUser($username: String!) {
      updateUser(username: $username) {
        token
        success
      }
    }
  `,
};
