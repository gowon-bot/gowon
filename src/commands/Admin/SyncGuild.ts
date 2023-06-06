import { displayNumber } from "../../lib/views/displays";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class SyncGuild extends AdminBaseCommand {
  idSeed = "billlie moon sua";

  description = "Syncs the list of server members with Gowon";
  aliases = ["sync", "serversync", "syncserver", "syncservermembers"];
  usage = "";

  adminCommand = true;
  slashCommand = true;

  async run() {
    const members = await this.requiredGuild.members.fetch();

    const discordIDs = members.map((m) => m.id);
    const guildID = this.requiredGuild.id;

    await this.lilacUsersService.syncGuild(this.ctx, guildID, discordIDs);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Server sync"))
      .setDescription(
        `Successfully synced ${displayNumber(discordIDs.length, "member")}`
      );

    await this.send(embed);
  }
}
