import gql from "graphql-tag";
import { ArtistTagCache } from "../database/entity/ArtistTagCache";
import { mirrorballClient } from "../lib/indexing/client";

export default async function () {
  const tags = await ArtistTagCache.find();

  const mutation = gql`
    mutation tagArtists($name: String!, $tags: [TagInput!]!) {
      tagArtists(artists: [{ name: $name }], tags: $tags)
    }
  `;

  for (const tag of tags) {
    const tagsVariable = tag.tags.map((t) => ({ name: t }));
    const artist = tag.artistName;

    console.log(`Processing ${artist}`);

    await mirrorballClient.mutate({
      mutation,
      variables: {
        name: artist,
        tags: tagsVariable,
      },
    });
  }
}
