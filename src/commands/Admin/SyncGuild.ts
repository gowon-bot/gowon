import { displayNumber } from "../../lib/views/displays";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class SyncGuild extends AdminBaseCommand {
  idSeed = "billlie moon sua";

  description = "Syncs the list of server members with Gowon";
  aliases = ["sync", "serversync", "syncserver", "syncservermembers"];
  usage = "";

  adminCommand = true;
  slashCommand = true;
  guildRequired = true;

  async run() {
    const members = await this.requiredGuild.members.fetch();

    const discordIDs = members.map((m) => m.id);
    const guildID = this.requiredGuild.id;

    await this.lilacGuildsService.sync(this.ctx, guildID, discordIDs);

    const embed = this.authorEmbed()
      .setHeader("Server sync")
      .setDescription(
        `Successfully synced ${displayNumber(discordIDs.length, "member")}`
      );

    await this.send(embed);
  }
}
