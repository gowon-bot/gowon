import gql from "graphql-tag";
import { GowonClient } from "../lib/GowonClient";
import { mirrorballClient } from "../lib/indexing/client";

export default async function syncAllGuilds({
  gowonClient,
}: {
  gowonClient: GowonClient;
}) {
  const guilds = gowonClient.client.guilds.cache.array();

  for (const guild of guilds) {
    const members = await guild.members.fetch();

    const mutation = gql`
      mutation syncGuild($guildID: String!, $discordIDs: [String!]!) {
        syncGuild(guildID: $guildID, discordIDs: $discordIDs)
      }
    `;

    const discordIDs = members.map((m) => m.id);
    const guildID = guild.id;

    await mirrorballClient.mutate({
      mutation,
      variables: { discordIDs, guildID },
    });
  }
}
