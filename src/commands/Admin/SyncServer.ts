import gql from "graphql-tag";
import { displayNumber } from "../../lib/views/displays";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class SyncServer extends AdminBaseCommand {
  idSeed = "billlie moon sua";

  description = "Syncs the list of server members with Gowon";
  aliases = ["sync", "serversync"];
  usage = "";

  adminCommand = true;
  slashCommand = true;

  async run() {
    const members = await this.requiredGuild.members.fetch();

    const mutation = gql`
      mutation syncGuild($guildID: String!, $discordIDs: [String!]!) {
        syncGuild(guildID: $guildID, discordIDs: $discordIDs)
      }
    `;

    const discordIDs = members.map((m) => m.id);
    const guildID = this.requiredGuild.id;

    await this.mirrorballService.mutate(this.ctx, mutation, {
      discordIDs,
      guildID,
    });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Server sync"))
      .setDescription(
        `Successfully synced ${displayNumber(discordIDs.length, "member")}`
      );

    await this.send(embed);
  }
}
