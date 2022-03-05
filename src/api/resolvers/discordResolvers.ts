import { serverIconURL } from "../../helpers/discord";
import { GowonClient } from "../../lib/GowonClient";

export default (client: GowonClient) => ({
  queries: {
    async guild(
      _: any,
      { guildID }: { guildID: string },
      { doughnutID }: { doughnutID: string }
    ): Promise<APIGuild> {
      const guild = await client.client.guilds.fetch(guildID);

      let canAdmin: boolean;

      try {
        canAdmin = await client.canUserAdminGuild(guild, doughnutID);
      } catch (e) {
        console.log(e);
      }

      return {
        id: guild.id,
        name: guild.name,
        image: guild.icon ? serverIconURL(guild.id, guild.icon) : "",
        canAdmin: canAdmin!,
      };
    },

    async roles(_: any, { guildID }: { guildID: string }): Promise<APIRole[]> {
      const guild = await client.client.guilds.fetch(guildID);

      return guild.roles.cache
        .map((r) => ({
          id: r.id,
          name: r.name,
          colour: r.hexColor,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
});

interface APIGuild {
  id: string;
  name: string;
  image: string | undefined;
  canAdmin: boolean;
}

interface APIRole {
  id: string;
  name: string;
  colour: string;
}
