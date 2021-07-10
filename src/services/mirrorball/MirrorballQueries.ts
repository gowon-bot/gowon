import { gql } from "@apollo/client/core";

export type MirrorballQuery = keyof typeof MirrorballQueries;

export function isMirrorballQuery(
  query: Uppercase<string>
): query is MirrorballQuery {
  return Object.keys(MirrorballQueries).includes(query);
}

export const MirrorballQueries = {
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
